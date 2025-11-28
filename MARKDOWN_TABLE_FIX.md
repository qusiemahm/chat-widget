# Fix Markdown Tables in Chat Widget

## Problem
Markdown tables from Claude show as plain text with pipes `|` visible instead of formatted HTML tables.

Current code (line 1150 in TharwahChat-V1.js):
```javascript
messageDiv.innerHTML = `
  <div class="tharwah-chat-message-content">${this.escapeHtml(content)}</div>
`;
```

This escapes ALL HTML/markdown, turning it into plain text.

## Solution

Add a simple markdown renderer that converts:
- **Bold**: `**text**` → `<strong>text</strong>`
- *Italic*: `*text*` → `<em>text</em>`  
- Tables: Markdown tables → HTML `<table>`
- Links: `[text](url)` → `<a href="url">text</a>`
- Lists: `- item` → `<ul><li>item</li></ul>`

### Implementation Steps:

1. **Add markdown rendering method** (add after line 1209):

```javascript
renderMarkdown(text) {
  if (!text) return '';
  
  // Sanitize first (prevent XSS)
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // Convert markdown tables to HTML
  text = this.convertMarkdownTables(text);
  
  // Bold: **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  
  // Line breaks
  text = text.replace(/\n/g, '<br>');
  
  return text;
}

convertMarkdownTables(text) {
  // Match markdown table pattern
  const tableRegex = /(\|.+\|)\n(\|[-:\s|]+\|)\n((?:\|.+\|\n?)+)/g;
  
  return text.replace(tableRegex, (match, header, separator, body) => {
    // Parse header
    const headers = header.split('|')
      .map(h => h.trim())
      .filter(h => h);
    
    // Parse body rows
    const rows = body.trim().split('\n')
      .map(row => row.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell)
      );
    
    // Build HTML table
    let html = '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px;">';
    
    // Header
    html += '<thead><tr>';
    headers.forEach(h => {
      html += `<th style="border: 1px solid #e5e7eb; padding: 8px 12px; background: #f9fafb; text-align: left; font-weight: 600;">${h}</th>`;
    });
    html += '</tr></thead>';
    
    // Body
    html += '<tbody>';
    rows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td style="border: 1px solid #e5e7eb; padding: 8px 12px;">${cell}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    return html;
  });
}
```

2. **Update message rendering** (line 1149-1151):

```javascript
// OLD:
messageDiv.innerHTML = `
  <div class="tharwah-chat-message-content">${this.escapeHtml(content)}</div>
`;

// NEW:
const formattedContent = sender === 'bot' 
  ? this.renderMarkdown(content)  // Render markdown for bot messages
  : this.escapeHtml(content);      // Escape HTML for user messages (security)

messageDiv.innerHTML = `
  <div class="tharwah-chat-message-content">${formattedContent}</div>
`;
```

3. **Update streaming message append** (find where streaming text is added):

Search for where `currentStreamingMessage` text is updated and apply same logic.

## Alternative: Use a Library

If you want full markdown support, add marked.js:

```html
<!-- Add to your HTML before TharwahChat-V1.js -->
<script src="https://cdn.jsdelivr.net/npm/marked@9.0.0/marked.min.js"></script>
```

Then in code:
```javascript
renderMarkdown(text) {
  if (typeof marked !== 'undefined') {
    return marked.parse(text, { 
      breaks: true,
      gfm: true  // GitHub Flavored Markdown (includes tables)
    });
  }
  // Fallback to escapeHtml if marked not available
  return this.escapeHtml(text);
}
```

## Testing

After implementing, test with:
- "Compare SHRM-CP and ACHRM"
- Should show a proper HTML table with borders
- Bold text should work: **Important**
- Links should work: [Visit](https://example.com)
