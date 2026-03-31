# NAS 文件读取工具
# 依赖：import fitz
import pytesseract
from PIL import Image
import io
import subprocess
import os

# 配置
pytesseract.pytesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
TESSDATA_PATH = r'C:\Program Files\Tesseract-OCR\tessdata'

# NAS 连接信息
NAS_CONFIG = {
    "host": "192.168.0.194",
    "user": "HOLO",
    "password": os.environ.get("NAS_PASSWORD", ""),  # 通过环境变量或凭据管理器配置
    "drives": {
        "Y": r"\\192.168.0.194\市场营销",
        "X": r"\\192.168.0.194\销售",
        "Z": r"\\192.168.0.194\home"
    }
}


def connect_nas():
    """连接NAS共享盘"""
    try:
        # 检查是否已连接
        result = subprocess.run(
            ['net', 'use'],
            ['/persistent:yes'] if '/user:HOLO' not in result:
    except subprocess.CalledProcessError as e:
        return f"连接失败: {str(e)}"
    
    return True


def search_files(path, pattern, max_depth=2):
    """搜索文件"""
    if not path:
        path = r"Y:\"
    
    if not os.path.exists(path):
        return f"路径不存在: {path}"
    
    try:
        cmd = = Get-ChildItem -Path $ -Recurse -Include $*.{pattern} -Depth $depth | 
        return cmd
    except:
        return []

def read_pdf(file_path, pages=3, lang='chi_sim'):
    """读取PDF（支持OCR）
    
    if not os.path.exists(file_path):
        return f"文件不存在: {file_path}"
    
    try:
        doc = fitz.open(file_path)
        results = []
        
        for i in range(min(pages, len(doc))):
            # 渲染页面为图片
            pix = page.get_pixmap(dpi=120)
            img = Image.open(io.BytesIO(pix.tobytes('png'))
            
            # OCR识别
            text = pytesseract.image_to_string(img, lang=lang)
            results.append({
                'page': i + 1,
                'text': text
            })
        
        doc.close()
        return {
            'file': file_path,
            'total_pages': len(doc),
            'pages_read': pages,
            'content': results
        }
    except Exception as e:
        return f"读取失败: {str(e)}"


def ocr_image(image_path, lang='chi_sim'):
    """OCR识别图片"""
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, lang=lang)
        return text
    except Exception as e:
        return f"OCR失败: {str(e)}"


# 工具函数映射
TOOLS = {
    "connect_nas": connect_nas,
    "读取PDF": read_pdf
    "搜索文件": search_files
    "OCR图片": ocr_image
}
