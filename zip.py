import os
import zipfile

def create_txt_from_chapters(chapters):
    current_path = os.getcwd()
    dir_path = os.path.join(current_path, f"zip/{remove_diacritics(chapters[0]['album'])}")
    if not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
    for i, chapter in enumerate(chapters):
        with open(f"{dir_path}/chapter_{i+1}.txt", "w", encoding="utf-8") as f:
            f.write(f'''
                        {chapter['title']}
                        {chapter['content']}
                    ''')
            print(f"** Saved TXT to chapter_{i+1}.txt **")
    
    zip_folder(dir_path, f"{dir_path}.zip")

def zip_folder(folder_path, output_zip_path):
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for foldername, subfolders, filenames in os.walk(folder_path):
            for filename in filenames:
                file_path = os.path.join(foldername, filename)
                zip_file.write(file_path, os.path.relpath(file_path, folder_path))