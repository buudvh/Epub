import requests
from bs4 import BeautifulSoup
import asyncio
import os
import unicodedata
import re
from ebooklib import epub
import uuid
from lxml import etree

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

# def get_chapter_content(soup):
#     content_body_tag = soup.find(id="content")
#     if content_body_tag:
#         for tag in content_body_tag.find_all(['a', 'div']):
#             if tag.name == 'a' or tag.name == 'div':
#                     tag.extract()
#     return "\n".join(content_body_tag.stripped_strings)
def get_chapter_content(soup):
    content_body_tag = soup.find(id="content")
    if content_body_tag:
        for tag in content_body_tag.find_all(['a', 'div']):
            tag.extract()  # Loại bỏ các thẻ không cần thiết
        # Tạo nội dung hợp lệ cho XHTML
        return "<p>" + "</p><p>".join(content_body_tag.stripped_strings) + "</p>"
    return ""

def calculate_chapter_list(start, lenght):
    list_page = []
    start_page_num = int((start+1)/NUM_CHAPTER_PER_PAGE)
    end_page_num = int((start+lenght)/NUM_CHAPTER_PER_PAGE)
    list_page.append(start_page_num)
    if start_page_num != end_page_num:
        list_page.append(end_page_num)
    return list_page

def get_book_name(soup):
    title_tag = soup.find_all('h1')
    return title_tag[0].text

def get_all_chapter(book_link, start, lenght):
    list_page = calculate_chapter_list(start, lenght)
    chapters = []
    for page in list_page:
        response = requests.get(book_link+f"?trang={page+1}")
        soup = BeautifulSoup(response.content, "html.parser")

        book_name = get_book_name(soup)

        chapter_list_tab = soup.find('div', id='divtab').find('ul', class_='w3-ul')
        chapter_tags = chapter_list_tab.find_all('li')
        for index, chapter_tag in enumerate(chapter_tags):
            index = index + page*NUM_CHAPTER_PER_PAGE
            if index < start or index > start + lenght:
                continue

            link_tag = chapter_tag.find('a')

            if link_tag is None:
                continue

            chapter = {
                'link': link_tag['href'],
                'title': chapter_tag.find('a').text,
                'album': book_name
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
            print(f"** Retrieved '{chapter['title']}'")
        else:
            failCnt += 1
    return chapter

def create_epub_from_chapters(chapters):
    book = epub.EpubBook()
    
    book.set_identifier(str(uuid.uuid4()))
    book.set_title(chapters[0]['album']) 
    book.set_language('vi')
    
    # CSS cho định dạng
    style = '''
        body {
            font-family: Arial, sans-serif;
            margin: 5%;
            text-align: justify;
        }
        h1 {
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
            <h1>{chapter['title']}</h1>
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
    book.spine = ['nav'] + chapters_epub
    
    # Lưu tệp EPUB
    current_path = os.getcwd()
    dir_path = os.path.join(current_path, "epub")
    if not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
    epub_path = os.path.join(dir_path, remove_diacritics(chapters[0]['album']) + '.epub')
    epub.write_epub(epub_path, book, {})
    print(f"** Saved EPUB to {epub_path} **")

async def main():
    print("*********************************************START*************************************************************")
    chapters = get_all_chapter("https://metruyenvip.com/truyen/dragon-ball-tu-thoat-di-hanh-tinh-vegeta-bat-dau-41987", 0, 1)

    # Lấy nội dung của các chương
    chapterFull = []
    for chapter in chapters:
        chapterFull.append(create_epub_chapter(chapter))

    # Xử lý tạo EPUB sau khi có nội dung các chương
    create_epub_from_chapters(chapterFull)

if __name__ == "__main__":
    asyncio.run(main())
    print("**********************************************END*************************************************************")