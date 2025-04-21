/**
 * UI components for ComfyUI plugins
 */

// Simple element creation helper function
export function $el(tag, options = {}, ...children) {
  const element = document.createElement(tag);
  
  // Set attributes and properties
  for (const key in options) {
    if (key === 'className') {
      element.className = options[key];
    } else if (key === 'style') {
      Object.assign(element.style, options[key]);
    } else if (key === 'dataset') {
      for (const dataKey in options[key]) {
        element.dataset[dataKey] = options[key][dataKey];
      }
    } else if (key.startsWith('on') && typeof options[key] === 'function') {
      element.addEventListener(key.substring(2).toLowerCase(), options[key]);
    } else {
      element[key] = options[key];
    }
  }
  
  // Append children
  for (const child of children) {
    if (child instanceof Node) {
      element.appendChild(child);
    } else if (child !== null && child !== undefined) {
      element.appendChild(document.createTextNode(String(child)));
    }
  }
  
  return element;
}

// Dialog component needed by the ComfyDeploy plugin
export class ComfyDialog {
  constructor() {
    this.element = document.createElement("div");
    this.element.className = "comfy-modal";
    this.element.style.display = "none";
    this.element.style.position = "fixed";
    this.element.style.zIndex = "1000";
    this.element.style.left = "0";
    this.element.style.top = "0";
    this.element.style.width = "100%";
    this.element.style.height = "100%";
    this.element.style.backgroundColor = "rgba(0,0,0,0.7)";
    this.element.style.justifyContent = "center";
    this.element.style.alignItems = "center";
    
    const content = document.createElement("div");
    content.className = "comfy-modal-content";
    content.style.backgroundColor = "#222";
    content.style.padding = "20px";
    content.style.borderRadius = "5px";
    content.style.minWidth = "300px";
    content.style.maxWidth = "80%";
    content.style.maxHeight = "80%";
    content.style.overflow = "auto";
    
    this.element.appendChild(content);
    document.body.appendChild(this.element);
  }
  
  show() {
    this.element.style.display = "flex";
    return this;
  }
  
  close() {
    this.element.style.display = "none";
    return this;
  }
}
