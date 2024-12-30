import { Groq } from "groq-sdk";

// This file is required by manifest.json
// It will be injected into YouTube pages
console.log('YouTube Transcript Copier content script loaded');

// Create and inject styles for the floating panel
const style = document.createElement('style');
style.textContent = `
  @keyframes gradientBorder {
    0% { border-image: linear-gradient(45deg, #3ea6ff, #34A853, #3ea6ff) 1; }
    50% { border-image: linear-gradient(45deg, #34A853, #3ea6ff, #34A853) 1; }
    100% { border-image: linear-gradient(45deg, #3ea6ff, #34A853, #3ea6ff) 1; }
  }

  .yt-transcript-panel {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 800px;
    background-color: #0f0f0f;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 9999;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    overflow: hidden;
    border: 2px solid transparent;
    color: #fff;
    animation: gradientBorder 3s linear infinite;
  }

  .yt-transcript-header {
    padding: 16px;
    background-color: #0f0f0f;
    color: #fff;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .video-info {
    padding: 16px;
    background-color: #161616;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .video-title {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #fff;
  }

  .video-meta {
    font-size: 12px;
    color: #aaa;
    display: flex;
    gap: 12px;
  }

  .channel-name {
    color: #3ea6ff;
    text-decoration: none;
    font-weight: 500;
  }

  .channel-name:hover {
    text-decoration: underline;
  }

  .yt-transcript-content {
    display: flex;
    gap: 16px;
    padding: 16px;
    height: 500px;
    transition: all 0.3s ease;
  }

  .transcript-column, .summary-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #161616;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .column-header {
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .column-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    font-size: 13px;
    line-height: 1.5;
    color: #fff;
  }

  .column-content::-webkit-scrollbar {
    width: 6px;
  }

  .column-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .column-content::-webkit-scrollbar-thumb {
    background-color: rgba(255,255,255,0.2);
    border-radius: 3px;
  }

  .markdown-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #161616;
  }

  .markdown-toolbar {
    display: flex;
    gap: 4px;
    padding: 8px;
    background-color: #202020;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    flex-wrap: wrap;
  }

  .toolbar-button {
    padding: 4px 8px;
    background-color: transparent;
    border: none;
    border-radius: 4px;
    color: #aaa;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .toolbar-button:hover {
    background-color: rgba(255,255,255,0.1);
    color: #fff;
  }

  .toolbar-button i {
    font-size: 14px;
  }

  .edit-area {
    flex: 1;
    width: 100%;
    padding: 16px;
    border: none;
    resize: none;
    font-family: 'Roboto Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
    color: #fff;
    background-color: #161616;
  }

  .edit-area:focus {
    outline: none;
  }

  .edit-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding: 12px;
    background-color: #202020;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .edit-button {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .edit-button:hover {
    transform: translateY(-1px);
  }

  .save-button {
    background-color: #3ea6ff;
    color: #0f0f0f;
  }

  .save-button:hover {
    background-color: #65b8ff;
  }

  .cancel-button {
    background-color: #272727;
    color: #fff;
  }

  .cancel-button:hover {
    background-color: #333;
  }

  .minimize-button, .collapse-button {
    background: none;
    border: none;
    color: #aaa;
    cursor: pointer;
    padding: 4px 8px;
    font-size: 18px;
    line-height: 1;
    border-radius: 4px;
  }

  .minimize-button:hover, .collapse-button:hover {
    background-color: rgba(255,255,255,0.1);
    color: #fff;
  }

  .yt-transcript-buttons {
    display: flex;
    gap: 12px;
    padding: 16px;
    border-top: 1px solid rgba(255,255,255,0.1);
    background-color: #0f0f0f;
  }

  .yt-transcript-button {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .yt-transcript-button:hover {
    transform: translateY(-1px);
  }

  .yt-transcript-button.primary {
    background-color: #3ea6ff;
    color: #0f0f0f;
  }

  .yt-transcript-button.primary:hover {
    background-color: #65b8ff;
  }

  .yt-transcript-button.secondary {
    background-color: #272727;
    color: #fff;
  }

  .yt-transcript-button.secondary:hover {
    background-color: #333;
  }

  .timestamp {
    color: #aaa;
    font-weight: 500;
    margin-right: 8px;
    user-select: none;
    font-size: 12px;
  }

  h1, h2, h3 {
    color: #fff;
    margin-top: 16px;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  p {
    margin: 8px 0;
  }

  br + br {
    display: none;
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin: 4px 0;
  }

  blockquote {
    border-left: 3px solid #3ea6ff;
    margin: 8px 0;
    padding-left: 12px;
    color: #aaa;
  }
`;
document.head.appendChild(style);

// Function to get video metadata
function getVideoMetadata() {
    const title = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent || '';
    const channelName = document.querySelector('ytd-watch-metadata ytd-channel-name yt-formatted-string a')?.textContent || '';
    const channelLink = document.querySelector('ytd-watch-metadata ytd-channel-name yt-formatted-string a')?.href || '';
    const views = document.querySelector('ytd-watch-metadata #info-container yt-formatted-string#info')?.textContent || '';

    return { title, channelName, channelLink, views };
}

// Function to convert markdown to HTML
function markdownToHtml(markdown) {
    return markdown
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/- (.*$)/gm, '<li>$1</li>')
        .replace(/<li>(.*)<\/li>/gm, '<ul><li>$1</li></ul>')
        .replace(/<\/ul><ul>/g, '')
        .replace(/\n{2,}/g, '<br>')
        .replace(/\n/g, ' ')
        .trim();
}

// Create the floating panel
const panel = document.createElement('div');
panel.className = 'yt-transcript-panel';

// Get video metadata
const metadata = getVideoMetadata();

// Initialize panel content
panel.innerHTML = `
  <div class="yt-transcript-header">
    YouTube Transcript Tools
    <button class="minimize-button">−</button>
  </div>
  <div class="video-info">
    <div class="video-title">${metadata.title}</div>
    <div class="video-meta">
      <a href="${metadata.channelLink}" class="channel-name" target="_blank">${metadata.channelName}</a>
      <span>${metadata.views}</span>
    </div>
  </div>
  <div class="yt-transcript-content">
    <div class="transcript-column">
      <div class="column-header">Transcript</div>
      <div class="column-content" id="transcript-text"></div>
    </div>
    <div class="summary-column">
      <div class="column-header">AI Analysis</div>
      <div class="column-content">
        <div class="summary-section">
          <div class="section-header">
            <div class="section-title">Timeline Breakdown</div>
            <button class="edit-button" data-section="timeline">Edit</button>
          </div>
          <div class="section-content" id="timeline-content"></div>
        </div>
        <div class="summary-section" style="margin-top: 20px;">
          <div class="section-header">
            <div class="section-title">Overall Summary</div>
            <button class="edit-button" data-section="summary">Edit</button>
          </div>
          <div class="section-content" id="summary-content"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="yt-transcript-buttons">
    <button class="yt-transcript-button primary" id="copy-button">Copy Transcript</button>
    <button class="yt-transcript-button secondary" id="summarize-button">Analyze</button>
  </div>
`;

// Add panel to page
document.body.appendChild(panel);

// Get button elements
const copyButton = panel.querySelector('#copy-button');
const summarizeButton = panel.querySelector('#summarize-button');
const minimizeButton = panel.querySelector('.minimize-button');
const content = panel.querySelector('.yt-transcript-content');
const transcriptText = panel.querySelector('#transcript-text');
const summaryText = panel.querySelector('#summary-text');

let isMinimized = false;

// Minimize/maximize functionality
minimizeButton.addEventListener('click', () => {
    isMinimized = !isMinimized;
    content.style.display = isMinimized ? 'none' : 'flex';
    panel.querySelector('.video-info').style.display = isMinimized ? 'none' : 'block';
    panel.querySelector('.yt-transcript-buttons').style.display = isMinimized ? 'none' : 'flex';
    minimizeButton.textContent = isMinimized ? '+' : '−';
});

// Copy transcript functionality
copyButton.addEventListener('click', async () => {
    try {
        const transcriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (transcriptSegments.length === 0) {
            alert('No transcript found. Please open the transcript panel first.');
            return;
        }

        const transcript = Array.from(transcriptSegments)
            .map(segment => {
                const textElement = segment.querySelector('.segment-text');
                const timestampElement = segment.querySelector('.segment-timestamp');
                if (!textElement || !timestampElement) return '';

                const timestamp = timestampElement.textContent.trim();
                const text = textElement.textContent.trim();
                return `<span class="timestamp">[${timestamp}]</span>${text}`;
            })
            .filter(text => text)
            .join('<br>');

        if (!transcript) {
            alert('Could not extract transcript text. Please make sure the transcript panel is open and visible.');
            return;
        }

        await navigator.clipboard.writeText(transcript.replace(/<[^>]*>/g, ''));
        transcriptText.innerHTML = transcript;

        copyButton.textContent = 'Copied!';
        copyButton.style.backgroundColor = '#34A853';

        setTimeout(() => {
            copyButton.textContent = 'Copy Transcript';
            copyButton.style.backgroundColor = '#4285f4';
        }, 2000);
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Function to create markdown toolbar
function createMarkdownToolbar(textarea) {
    const toolbar = document.createElement('div');
    toolbar.className = 'markdown-toolbar';

    const tools = [
        { icon: '# ', label: 'H1', action: () => wrapText(textarea, '# ', '') },
        { icon: '## ', label: 'H2', action: () => wrapText(textarea, '## ', '') },
        { icon: '### ', label: 'H3', action: () => wrapText(textarea, '### ', '') },
        { icon: 'B', label: 'Bold', action: () => wrapText(textarea, '**', '**') },
        { icon: 'I', label: 'Italic', action: () => wrapText(textarea, '*', '*') },
        { icon: '> ', label: 'Quote', action: () => wrapText(textarea, '> ', '') },
        { icon: '- ', label: 'List', action: () => wrapText(textarea, '- ', '') },
        { icon: '1. ', label: 'Numbered', action: () => wrapText(textarea, '1. ', '') },
        { icon: '`', label: 'Code', action: () => wrapText(textarea, '`', '`') },
        { icon: '---', label: 'Line', action: () => insertText(textarea, '\\n---\\n') }
    ];

    tools.forEach(tool => {
        const button = document.createElement('button');
        button.className = 'toolbar-button';
        button.innerHTML = `<i>${tool.icon}</i>${tool.label}`;
        button.addEventListener('click', (e) => {
            e.preventDefault();
            tool.action();
            textarea.focus();
        });
        toolbar.appendChild(button);
    });

    return toolbar;
}

// Helper functions for markdown editing
function wrapText(textarea, before, after) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end);
    const replacement = before + selection + after;

    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = end + before.length;
}

function insertText(textarea, text) {
    const start = textarea.selectionStart;
    textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(start);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
}

// Update the createEditableArea function
function createEditableArea(content, section) {
    const editorContainer = document.createElement('div');
    editorContainer.className = 'markdown-editor';

    const textarea = document.createElement('textarea');
    textarea.className = 'edit-area';
    textarea.value = content.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '');

    const toolbar = createMarkdownToolbar(textarea);

    const actions = document.createElement('div');
    actions.className = 'edit-actions';
    actions.innerHTML = `
        <button class="edit-button cancel-button">Cancel</button>
        <button class="edit-button save-button">Save</button>
    `;

    editorContainer.appendChild(toolbar);
    editorContainer.appendChild(textarea);
    editorContainer.appendChild(actions);

    return editorContainer;
}

// Update the setupEditButton function
function setupEditButton(section) {
    const editButton = document.querySelector(`[data-section="${section}"]`);
    const contentDiv = document.querySelector(`#${section}-content`);

    if (!editButton || !contentDiv) {
        console.error(`Could not find elements for section: ${section}`);
        return;
    }

    editButton.addEventListener('click', () => {
        const currentContent = contentDiv.innerHTML;
        const originalContent = contentDiv.innerHTML;

        // Create editable area
        const editorContainer = createEditableArea(currentContent, section);
        contentDiv.innerHTML = '';
        contentDiv.appendChild(editorContainer);

        const textarea = contentDiv.querySelector('textarea');
        const saveButton = contentDiv.querySelector('.save-button');
        const cancelButton = contentDiv.querySelector('.cancel-button');

        if (textarea && saveButton && cancelButton) {
            saveButton.addEventListener('click', () => {
                const newContent = markdownToHtml(textarea.value);
                contentDiv.innerHTML = newContent;
            });

            cancelButton.addEventListener('click', () => {
                contentDiv.innerHTML = originalContent;
            });
        }
    });
}

// Call setupEditButton after the panel is added to the document
document.body.appendChild(panel);
setupEditButton('timeline');
setupEditButton('summary');

// Update the summarize functionality
summarizeButton.addEventListener('click', async () => {
    try {
        const transcriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (transcriptSegments.length === 0) {
            alert('No transcript found. Please open the transcript panel first.');
            return;
        }

        const transcript = Array.from(transcriptSegments)
            .map(segment => segment.querySelector('.segment-text')?.textContent.trim())
            .filter(text => text)
            .join(' ');

        summarizeButton.textContent = 'Analyzing...';
        summarizeButton.disabled = true;

        const groq = new Groq({
            apiKey: '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',
            dangerouslyAllowBrowser: true
        });

        // Timeline breakdown request
        const timelinePrompt = `Analyze this video transcript and provide a concise breakdown of the content in chronological order. Format your response as a clean list without timestamps or time markers:
# Timeline Breakdown

- [First topic or segment discussed]
- [Second topic or segment discussed]
- [Third topic or segment discussed]
(continue for all major segments)

Keep each point brief and focused on the content. Avoid any references to time or duration.

Here's the transcript: ${transcript}`;

        // Overall summary request
        const summaryPrompt = `Analyze this video transcript and provide a comprehensive summary. Format your response exactly like this:
# Overall Summary

## Main Topic
Brief description of the video's main subject and purpose

## Key Points
- First major point or takeaway
- Second major point
- Third major point
(continue for all key points)

## Notable Quotes
> "Direct quote from the video" - Speaker name (if available)
(include 2-3 most impactful quotes)

Here's the transcript: ${transcript}`;

        // Make both API calls concurrently
        const [timelineResponse, summaryResponse] = await Promise.all([
            groq.chat.completions.create({
                messages: [{ role: "user", content: timelinePrompt }],
                model: "llama-3.3-70b-versatile",
            }),
            groq.chat.completions.create({
                messages: [{ role: "user", content: summaryPrompt }],
                model: "llama-3.3-70b-versatile",
            })
        ]);

        const timelineContent = timelineResponse.choices[0]?.message?.content;
        const summaryContent = summaryResponse.choices[0]?.message?.content;

        if (timelineContent) {
            panel.querySelector('#timeline-content').innerHTML = markdownToHtml(timelineContent);
        }
        if (summaryContent) {
            panel.querySelector('#summary-content').innerHTML = markdownToHtml(summaryContent);
        }

        summarizeButton.textContent = 'Analyze';
        summarizeButton.disabled = false;
    } catch (error) {
        alert('Error generating analysis: ' + error.message);
        summarizeButton.textContent = 'Analyze';
        summarizeButton.disabled = false;
    }
});

// Update the panel HTML to remove collapse button
const transcriptHeader = panel.querySelector('.transcript-column .column-header');
transcriptHeader.innerHTML = 'Transcript';

// Remove the restore button and its functionality
const existingRestoreButton = panel.querySelector('.restore-transcript-button');
if (existingRestoreButton) {
    existingRestoreButton.remove();
}

// Remove collapse button and its functionality
const existingCollapseButton = panel.querySelector('.collapse-button');
if (existingCollapseButton) {
    existingCollapseButton.remove();
} 