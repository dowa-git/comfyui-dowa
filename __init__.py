"""
ComfyUI-DOWA: Navigation Widget for Multi-User ComfyUI
Provides persistent navigation bar with authentication, templates, and user management.
"""

from .navigation_node import DowaNavigationNode

# Register nodes with ComfyUI
NODE_CLASS_MAPPINGS = {
    "DowaNavigationNode": DowaNavigationNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "DowaNavigationNode": "DOWA Navigation Bar",
}

# Extension metadata
WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
