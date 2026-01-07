import os

def save_path(id, filename):
    # 保存先ディレクトリのパスを生成
    directory = f'./output/{id}'
    # もしディレクトリがなければ作成する (exist_ok=True で既存でもエラーにならない)
    os.makedirs(directory, exist_ok=True)
    
    return f'{directory}/{filename}'


def save_file(id, filename, content):
    # save_pathの中でディレクトリが作成されるので、そのままopenできる
    path = save_path(id, filename)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
