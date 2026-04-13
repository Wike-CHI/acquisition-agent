"""
HOLO 社媒图片生成器 - 平台风格定义
支持 9 种社媒平台的不同风格
"""

from typing import Dict, Tuple

# 尺寸定义 (宽度 x 高度)
PLATFORM_SIZES = {
    # Instagram
    "instagram_post": (1080, 1080),  # 正方形
    "instagram_story": (1080, 1920),  # 故事图
    "instagram_landscape": (1080, 566),  # 横图

    # LinkedIn
    "linkedin_post": (1200, 627),  # 标准帖子
    "linkedin_article": (1200, 628),  # 文章封面

    # Facebook
    "facebook_post": (1200, 630),  # 动态帖子
    "facebook_cover": (820, 312),  # 封面

    # TikTok
    "tiktok_video": (1080, 1920),  # 视频封面

    # YouTube
    "youtube_thumbnail": (1280, 720),  # 缩略图
    "youtube_banner": (2560, 1440),  # 横幅

    # Twitter/X
    "twitter_post": (1600, 900),  # 推文配图

    # Pinterest
    "pinterest_pin": (1000, 1500),  # 图钉

    # 通用
    "square": (1080, 1080),
    "portrait": (1080, 1350),
    "landscape": (1920, 1080),
    "story": (1080, 1920),
}


class PlatformStyle:
    """平台风格类"""

    def __init__(
        self,
        name: str,
        display_name: str,
        size: Tuple[int, int],
        primary_color: str,
        secondary_color: str,
        bg_color: str,
        text_color: str,
        accent_color: str,
        font_family: str,
        style: str,  # "bold" | "minimal" | "modern" | "classic"
        features: list,  # ["product_image", "specs", "cta", "logo"]
    ):
        self.name = name
        self.display_name = display_name
        self.size = size
        self.primary_color = primary_color
        self.secondary_color = secondary_color
        self.bg_color = bg_color
        self.text_color = text_color
        self.accent_color = accent_color
        self.font_family = font_family
        self.style = style
        self.features = features

    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "display_name": self.display_name,
            "size": self.size,
            "colors": {
                "primary": self.primary_color,
                "secondary": self.secondary_color,
                "background": self.bg_color,
                "text": self.text_color,
                "accent": self.accent_color,
            },
            "font_family": self.font_family,
            "style": self.style,
            "features": self.features,
        }


# HOLO 品牌颜色
HOLO_RED = "#D32F2F"
HOLO_DARK = "#1A1A1A"
HOLO_LIGHT = "#F5F5F5"
HOLO_GRAY = "#757575"

# 9 种社媒平台风格
PLATFORM_STYLES = {
    # ============================================
    # Instagram 系列
    # ============================================
    "instagram_pro": PlatformStyle(
        name="instagram_pro",
        display_name="Instagram 专业版",
        size=PLATFORM_SIZES["instagram_post"],
        primary_color=HOLO_RED,
        secondary_color="#FF5722",
        bg_color="#FFFFFF",
        text_color="#1A1A1A",
        accent_color="#D32F2F",
        font_family="Inter, system-ui, sans-serif",
        style="bold",
        features=["product_image", "specs", "highlights", "cta"],
    ),

    "instagram_story": PlatformStyle(
        name="instagram_story",
        display_name="Instagram 故事",
        size=PLATFORM_SIZES["instagram_story"],
        primary_color=HOLO_RED,
        secondary_color="#FF8A65",
        bg_color="#000000",
        text_color="#FFFFFF",
        accent_color="#FF5722",
        font_family="Inter, system-ui, sans-serif",
        style="modern",
        features=["product_image", "tagline", "cta"],
    ),

    # ============================================
    # LinkedIn 系列
    # ============================================
    "linkedin_pro": PlatformStyle(
        name="linkedin_pro",
        display_name="LinkedIn 专业版",
        size=PLATFORM_SIZES["linkedin_post"],
        primary_color="#0077B5",  # LinkedIn 蓝
        secondary_color="#00A0DC",
        bg_color="#F3F2EF",
        text_color="#1A1A1A",
        accent_color="#0077B5",
        font_family="Inter, system-ui, sans-serif",
        style="minimal",
        features=["product_image", "specs", "certifications", "contact"],
    ),

    "linkedin_dark": PlatformStyle(
        name="linkedin_dark",
        display_name="LinkedIn 深色版",
        size=PLATFORM_SIZES["linkedin_post"],
        primary_color="#0077B5",
        secondary_color="#00A0DC",
        bg_color="#1A1A1A",
        text_color="#FFFFFF",
        accent_color="#00A0DC",
        font_family="Inter, system-ui, sans-serif",
        style="modern",
        features=["product_image", "headline", "specs"],
    ),

    # ============================================
    # Facebook 系列
    # ============================================
    "facebook_engaging": PlatformStyle(
        name="facebook_engaging",
        display_name="Facebook 互动版",
        size=PLATFORM_SIZES["facebook_post"],
        primary_color=HOLO_RED,
        secondary_color="#1976D2",
        bg_color="#FFFFFF",
        text_color="#1A1A1A",
        accent_color="#FFC107",
        font_family="Inter, system-ui, sans-serif",
        style="bold",
        features=["product_image", "benefits", "cta", "social_proof"],
    ),

    # ============================================
    # TikTok 系列
    # ============================================
    "tiktok_dyn": PlatformStyle(
        name="tiktok_dyn",
        display_name="TikTok 动感版",
        size=PLATFORM_SIZES["tiktok_video"],
        primary_color="#00F2EA",  # TikTok 青
        secondary_color="#FF0050",  # TikTok 粉红
        bg_color="#000000",
        text_color="#FFFFFF",
        accent_color="#69C9D3",
        font_family="Inter, system-ui, sans-serif",
        style="bold",
        features=["product_image", "dynamic_text", "cta", "hashtags"],
    ),

    # ============================================
    # YouTube 系列
    # ============================================
    "youtube_thumb": PlatformStyle(
        name="youtube_thumb",
        display_name="YouTube 缩略图",
        size=PLATFORM_SIZES["youtube_thumbnail"],
        primary_color="#FF0000",  # YouTube 红
        secondary_color="#282828",
        bg_color="#000000",
        text_color="#FFFFFF",
        accent_color="#FF0000",
        font_family="Inter, system-ui, sans-serif",
        style="bold",
        features=["product_image", "bold_title", "high_contrast"],
    ),

    # ============================================
    # Twitter/X 系列
    # ============================================
    "twitter_x": PlatformStyle(
        name="twitter_x",
        display_name="Twitter/X 专业版",
        size=PLATFORM_SIZES["twitter_post"],
        primary_color="#000000",  # X 黑
        secondary_color="#FFFFFF",
        bg_color="#000000",
        text_color="#FFFFFF",
        accent_color="#1DA1F2",
        font_family="Inter, system-ui, sans-serif",
        style="minimal",
        features=["product_image", "concise_text", "brand"],
    ),

    # ============================================
    # Pinterest 系列
    # ============================================
    "pinterest_pin": PlatformStyle(
        name="pinterest_pin",
        display_name="Pinterest 图钉",
        size=PLATFORM_SIZES["pinterest_pin"],
        primary_color=HOLO_RED,
        secondary_color="#BD081C",  # Pinterest 红
        bg_color="#FFFFFF",
        text_color="#1A1A1A",
        accent_color="#BD081C",
        font_family="Inter, system-ui, sans-serif",
        style="elegant",
        features=["product_image", "inspirational", "source"],
    ),

    # ============================================
    # 专业工业参数图（参考图样式）
    # ============================================
    "spec_pro": PlatformStyle(
        name="spec_pro",
        display_name="专业参数图 (参考图样式)",
        size=PLATFORM_SIZES["portrait"],
        primary_color="#D32F2F",
        secondary_color="#1A1A1A",
        bg_color="#FFFFFF",
        text_color="#1A1A1A",
        accent_color="#D32F2F",
        font_family="'Inter', -apple-system, sans-serif",
        style="industrial",
        features=["product_image", "full_specs_table", "tech_cards", "components", "cta"],
    ),

    "instagram_pro": PlatformStyle(
        name="instagram_pro",
        display_name="Instagram 专业版 (v4)",
        size=(1080, 1350),  # 竖版更合适
        primary_color="#D32F2F",
        secondary_color="#FF5722",
        bg_color="#FFFFFF",
        text_color="#1A1A1A",
        accent_color="#D32F2F",
        font_family="'Inter', system-ui, sans-serif",
        style="professional",
        features=["product_image", "full_specs_table", "tech_cards", "components", "cta"],
    ),

    # ============================================
    # 通用风格
    # ============================================
    "catalog_pro": PlatformStyle(
        name="catalog_pro",
        display_name="产品目录专业版",
        size=PLATFORM_SIZES["portrait"],
        primary_color=HOLO_RED,
        secondary_color="#1A1A1A",
        bg_color="#FFFFFF",
        text_color="#1A1A1A",
        accent_color=HOLO_RED,
        font_family="Inter, system-ui, sans-serif",
        style="minimal",
        features=["product_image", "full_specs", "certifications", "contact"],
    ),

    "industrial": PlatformStyle(
        name="industrial",
        display_name="工业风格",
        size=PLATFORM_SIZES["portrait"],
        primary_color="#1565C0",  # 工业蓝
        secondary_color="#0D47A1",
        bg_color="#ECEFF1",
        text_color="#1A1A1A",
        accent_color="#1565C0",
        font_family="Roboto, system-ui, sans-serif",
        style="industrial",
        features=["product_image", "technical_specs", "standards"],
    ),
}


def get_platform_style(name: str) -> PlatformStyle:
    """获取平台风格"""
    return PLATFORM_STYLES.get(name, PLATFORM_STYLES["catalog_pro"])


def list_platforms() -> list:
    """列出所有平台"""
    return [
        {
            "name": style.name,
            "display_name": style.display_name,
            "size": f"{style.size[0]}x{style.size[1]}",
            "style": style.style,
        }
        for style in PLATFORM_STYLES.values()
    ]


if __name__ == "__main__":
    # 测试
    for platform in list_platforms():
        print(f"{platform['name']}: {platform['display_name']} ({platform['size']})")
