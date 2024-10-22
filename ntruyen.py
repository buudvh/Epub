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
    content_tag = soup.find('div', id='chapter-content')
    if content_tag:
        for tag in content_tag.find_all(['a', 'div', 'center']):
            tag.extract()  # Loại bỏ các thẻ không cần thiết
        # Tạo nội dung hợp lệ cho XHTML
        return "<p>" + "</p><p>".join(content_tag.stripped_strings) + "</p>"
    return ""

def get_list_chapter_in_page(book_link, page):
    url = 'https://ntruyen.top//ajax/load_chapter'
    payload = {
        'story_id': int(get_story_id(book_link)),
        'page': page + 1
    }

    response = requests.post(url, data=payload)

    if response.status_code == 200:
        data = response.json()
    else:
        data = None

    return data

def get_story_id(url):
    return url.split('/')[-1].split('.')[0].split('-')[-1]

def get_all_chapter(book_link, start, lenght):
    chapters = []
    #get max page
    response = requests.get(book_link)
    soup = BeautifulSoup(response.content, "html.parser")

    max_page = int(soup.find('button', id='goto-page').get("data-total"))
    book_inf_tag = soup.find_all('div', class_='story-title')[0];
    book_name = book_inf_tag.find_all('h1')[0].text
    author_name = book_inf_tag.find_all('a')[0].text
    cover_img = soup.find_all('div', class_='cover')[0].find_all('img')[0]['src']

    for i, p in tqdm(enumerate(range(max_page)), total=max_page, desc=f"Getting book information progress", unit="pages", ncols= 150):
        data = get_list_chapter_in_page(book_link, p)
        if data:
            soup_chapter = BeautifulSoup(data["chapters"], "html.parser")
            chapter_tags = soup_chapter.find_all('a')
            for tag in chapter_tags:
                chapters.append({
                'link': tag['href'],
                'title': tag.text,
                'album': book_name,
                'content': '',
                'author': author_name,
                'cover': cover_img
            })

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

def download_image_from_url(url, save_path):
    response = requests.get(url)
    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            f.write(response.content)
        return True
    else:
        return False

def create_epub_from_chapters(chapters):
    book = epub.EpubBook()

    book.set_identifier(str(uuid.uuid4()))
    book.set_title(chapters[0]['album'])
    book.set_language('vi')
    book.add_author(chapters[0]['author'])
    if download_image_from_url(chapters[0]['cover'], '/content/cover.jpg'):
      book.set_cover("cover.jpg", open('/content/cover.jpg', 'rb').read())

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
        uid="style_nav",
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
    convert_epub3_to_epub2(epub3_path, epub2_path)
    #download
    # files.download(epub2_path)
    # !cp "{epub2_path}" /content/drive/MyDrive/vBook
    print(f"** Saved EPUB {epub2_path} to your drive**")

def convert_epub3_to_epub2(input_epub, output_path):
    # Run Calibre's ebook-convert command to convert to EPUB 2
    try:
        subprocess.run([
            "ebook-convert",         # Calibre's CLI tool
            input_epub,              # Input EPUB 3 file
            output_path,             # Output EPUB 2 file
            "--epub-version=2",           # Force conversion to EPUB 2
            # "--no-default-epub-cover",

        ], check=True)
        print(f"Conversion successful: {output_path}")
    except subprocess.CalledProcessError as e:
        print(f"Error during conversion: {e}")
    finally:
        os.remove(input_epub)

async def async_process_chapter(chapter):
    async with semaphore:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, create_epub_chapter, chapter)

semaphore = asyncio.Semaphore(20)

async def main():
    # get all chapter infor
    chapters = get_all_chapter("https://ntruyen.top/truyen/tong-vo-bat-dau-max-cap-gia-y-than-cong-68083.html", 0, 5000)
    # get all chapter content
    tasks = [async_process_chapter(chapter) for chapter in chapters]
    print(f"** Retrieved '{chapters[0]['album']}' ({len(chapters)} chapters)")
    [await task for task in tqdm_asyncio(asyncio.as_completed(tasks), total=len(tasks), desc=f"Leeching progress", unit="books", ncols=150)]
    # Xử lý tạo EPUB sau khi có nội dung các chương
    create_epub_from_chapters(chapters)

if __name__ == "__main__":
    asyncio.run(main())
    print("**********************************************END*************************************************************")