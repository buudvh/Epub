import requests
from bs4 import BeautifulSoup
import asyncio
import os
import unicodedata
import re
from ebooklib import epub
import uuid
import subprocess
import os
import asyncio
import nest_asyncio
# from google.colab import files
from tqdm.asyncio import tqdm_asyncio
from tqdm import tqdm
import urllib.parse
from PIL import Image, ImageDraw, ImageFont
import textwrap

nest_asyncio.apply()

NUM_CHAPTER_PER_PAGE = 50

def remove_diacritics(text):
    normalized_string = unicodedata.normalize('NFD', text)
    result = []
    capitalize_next_char = True

    for char in normalized_string:
        if unicodedata.category(char) != 'Mn':
            if char.isalpha():
                if capitalize_next_char:
                    result.append(char.upper())
                    capitalize_next_char = False
                else:
                    result.append(char.lower())
            else:
                result.append(char)
                capitalize_next_char = True

    result_string = ''.join(result)
    return re.sub(r'[\W_]', '', result_string)

def get_chapter_content(soup):
    content_tag = soup.find_all('div', class_='mw-parser-output')[0]
    if content_tag:
        for tag in content_tag.find_all(['a', 'div', 'center']):
            tag.extract()
        return "<p>" + "</p><p>".join(content_tag.stripped_strings) + "</p>"
    return ""

def calculate_chapter_list(book_link):
    chap_list = [book_link]
    chapter_tags = None
    max_page = 1000000

    #get max page
    response = requests.get(book_link)
    soup = BeautifulSoup(response.content, "html.parser")
    content_tag = soup.find_all('div', class_='mw-parser-output')[0]
    for p in content_tag.find_all('p'):
        if "Trang:" in p.get_text(strip=True):
            chapter_tags = p.find_all('a')
            break

    if chapter_tags is None:
        return chap_list

    root_url = get_root_url(book_link)

    for tag in chapter_tags:
        chap_list.append(f"{root_url}{tag['href']}")
    return chap_list

def get_book_name(soup):
    content_tag = soup.find_all('div', class_='mw-parser-output')[0]
    title_tag = content_tag.find_all('span', class_='title')
    return title_tag[0].text

def get_author_name(soup):
    author_tag = None
    content_tag = soup.find_all('div', class_='mw-parser-output')[0]
    for span in content_tag.find_all('span'):
        if "Tác giả:" in span.get_text(strip=True):
            author_tag = span.find_all('a')[0]
            break

    if author_tag is None:
        return "Sưu tầm"

    return author_tag.text

def get_root_url(url):
    parsed_url = urllib.parse.urlparse(url)
    return parsed_url.scheme + "://" + parsed_url.netloc

def get_all_chapter(book_link, start, lenght):
    list_page = calculate_chapter_list(book_link)
    root_url = get_root_url(book_link)
    chapters = []
    for i, page in tqdm(enumerate(list_page), total=len(list_page), desc=f"Getting book information progress", unit="pages", ncols= 150):
        response = requests.get(page)
        soup = BeautifulSoup(response.content, "html.parser")

        book_name = get_book_name(soup)

        author_name = get_author_name(soup)

        content_tag = soup.find_all('div', class_='mw-parser-output')[0]
        chapter_list_tab = content_tag.find_all('ul', class_='subpagelist')[0]
        chapter_tags = chapter_list_tab.find_all('li')
        for index, chapter_tag in enumerate(chapter_tags):
            index = index + i*NUM_CHAPTER_PER_PAGE

            link_tag = chapter_tag.find('a')

            if link_tag is None:
                continue

            chapter = {
                'link': f"{root_url}{link_tag['href']}",
                'title': chapter_tag.find('a').text.replace("\n", ""),
                'album': book_name,
                'content': '',
                'index': index,
                'author': author_name,
                'cover': '/content/cover.jpg'
            }
            chapters.append(chapter)
    return chapters

def create_epub_chapter(chapter):
    failCnt = 0
    text = ''
    while failCnt < 5 and text == '':
        response = requests.get(chapter['link'])
        soup = BeautifulSoup(response.content, "html.parser")
        text = get_chapter_content(soup).replace('"', '').replace('“', '').replace('”', '')
        if text != '':
            chapter['content'] = text
        else:
            failCnt += 1
    return chapter

def create_epub_from_chapters(chapters, cover_img_path):
    book = epub.EpubBook()

    book.set_identifier(str(uuid.uuid4()))
    book.set_title(chapters[0]['album'])
    book.set_language('vi')
    book.add_author(chapters[0]['author'])
    # book.set_cover("cover.jpg", open(cover_img_path, 'rb').read(), create_page=False)

    # CSS cho định dạng
    style = '''
        body {
            font-family: Arial, sans-serif;
            margin: 5%;
            text-align: justify;
        }
        h4 {
            text-align: center;
            color: #333;
            margin-bottom: 2em;
        }
    '''
    # Tạo tệp CSS
    nav_css = epub.EpubItem(
        uid=str(uuid.uuid3(uuid.NAMESPACE_URL, "style/nav.css")),
        file_name="style/nav.css",
        media_type="text/css",
        content=style
    )
    book.add_item(nav_css)

    # Tạo các chương
    chapters_epub = []
    for i, chapter in enumerate(chapters):
        chapter_content = f'''
            <h4>{chapter['title']}</h4>
            {chapter['content']}
        '''

        c = epub.EpubHtml(
            title=chapter['title'],
            file_name=f'chapter_{i+1}.xhtml',
            content=chapter_content
        )
        c.add_link(href='style/nav.css', rel='stylesheet', type='text/css')  # Thêm liên kết CSS
        book.add_item(c)
        chapters_epub.append(c)

    # Thiết lập Table of Contents (TOC)
    book.toc = [(epub.Section('Mục lục'), chapters_epub)]

    # Thêm các mục NCX và NAV cho EPUB 2
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())

    # Thiết lập spine
    book.spine = chapters_epub

    # Lưu tệp EPUB
    current_path = os.getcwd()
    dir_path = os.path.join(current_path, "epub")
    if not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
    filename = remove_diacritics(chapters[0]['album']) + '.epub'
    epub2_path = os.path.join(dir_path, filename)
    epub3_path = os.path.join(dir_path, f'temp_{filename}')
    #save epub
    epub.write_epub(epub3_path, book)
    #convert to epub2
    convert_epub3_to_epub2(epub3_path, epub2_path, cover_img_path)
    #move to google drive
    !cp "{epub2_path}" /content/drive/MyDrive/vBook
    # print(f"** Saved EPUB {epub2_path} to your drive**")

def convert_epub3_to_epub2(input_epub, output_path, cover_img_path):
    # Run Calibre's ebook-convert command to convert to EPUB 2
    try:
        subprocess.run([
            "ebook-convert",         # Calibre's CLI tool
            input_epub,              # Input EPUB 3 file
            output_path,             # Output EPUB 2 file
            "--epub-version=2",           # Force conversion to EPUB 2
            "--remove-first-image",
            # "--no-default-epub-cover",
            f"--cover={cover_img_path}",
            # "--no-svg-cover"
        ], check=True)
        print(f"Conversion successful: {output_path}")
    except subprocess.CalledProcessError as e:
        print(f"Error during conversion: {e}")
    # finally:
    #     os.remove(input_epub)

async def async_process_chapter(chapter):
    async with semaphore:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, create_epub_chapter, chapter)

def create_cover_image(text, output_file, font_path="/content/drive/MyDrive/Font/Roboto-Regular.ttf"):
    width, height = 215, 322
    background_color = (200, 230, 255)  # Màu nền

    image = Image.new("RGB", (width, height), background_color)
    draw = ImageDraw.Draw(image)

    text_color = (0, 0, 0)
    font_size = 30

    font = ImageFont.truetype(font_path, font_size, encoding="unic")

    wrapped_text = textwrap.fill(text, width=7)

    lines = wrapped_text.splitlines()
    total_text_height = sum(draw.textbbox((0, 0), line, font=font)[3] - draw.textbbox((0, 0), line, font=font)[1] for line in lines)
    current_y = (height - total_text_height) // 2

    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_width, line_height = bbox[2] - bbox[0], bbox[3] - bbox[1]
        line_x = (width - line_width) // 2
        draw.text((line_x, current_y), line, fill=text_color, font=font)
        current_y += line_height

    image.save(output_file)

semaphore = asyncio.Semaphore(20)

async def main():
    # get all chapter infor
    chapters = get_all_chapter("https://truyenkiemhiep.com.vn/Anh_h%C3%B9ng_%C4%90%C3%B4ng_A_d%E1%BB%B1ng_c%E1%BB%9D_b%C3%ACnh_M%C3%B4ng", 0, 5000)
    # get all chapter content
    tasks = [async_process_chapter(chapter) for chapter in chapters]
    # create cover image
    cover_img_path = f"/content/{uuid.uuid4()}.jpg"
    create_cover_image(text=chapters[0]['album'], output_file=cover_img_path)
    print(f"** Retrieved '{chapters[0]['album']}' ({len(chapters)} chapters)")
    [await task for task in tqdm_asyncio(asyncio.as_completed(tasks), total=len(tasks), desc=f"Leeching progress", unit="books", ncols=150)]
    # Xử lý tạo EPUB sau khi có nội dung các chương
    create_epub_from_chapters(chapters, cover_img_path)

if __name__ == "__main__":
    asyncio.run(main())
    print("**********************************************END*************************************************************")