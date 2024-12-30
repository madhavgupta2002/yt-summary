import { Groq } from "groq-sdk";

// This file is required by manifest.json
// It will be injected into YouTube pages
console.log('YouTube Transcript Copier content script loaded');

// Create and inject styles for the floating panel
const style = document.createElement('style');
style.textContent = `
  .yt-transcript-panel {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 800px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    font-family: Arial, sans-serif;
    overflow: hidden;
  }

  .yt-transcript-header {
    padding: 16px;
    background-color: #4285f4;
    color: white;
    font-weight: bold;
    font-size: 18px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .video-info {
    padding: 16px;
    border-bottom: 1px solid #eee;
    background-color: #f8f9fa;
  }

  .video-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .video-meta {
    font-size: 13px;
    color: #606060;
    display: flex;
    gap: 12px;
  }

  .channel-name {
    color: #065fd4;
    text-decoration: none;
  }

  .yt-transcript-content {
    display: flex;
    gap: 20px;
    padding: 20px;
    height: 400px;
  }

  .transcript-column, .summary-column {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .column-header {
    font-size: 16px;
    font-weight: 500;
    color: #3c4043;
    margin-bottom: 12px;
  }

  .column-content {
    flex: 1;
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    overflow-y: auto;
    font-size: 14px;
    line-height: 1.6;
  }

  .summary-content h1, .summary-content h2, .summary-content h3 {
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .summary-content ul, .summary-content ol {
    margin: 8px 0;
    padding-left: 24px;
  }

  .summary-content li {
    margin: 4px 0;
  }

  .summary-content p {
    margin: 8px 0;
  }

  .timestamp {
    color: #666;
    font-weight: 500;
    margin-right: 8px;
  }

  .yt-transcript-buttons {
    display: flex;
    gap: 12px;
    padding: 16px;
    border-top: 1px solid #eee;
  }

  .yt-transcript-button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .yt-transcript-button.primary {
    background-color: #4285f4;
    color: white;
  }

  .yt-transcript-button.secondary {
    background-color: #f1f3f4;
    color: #3c4043;
  }

  .yt-transcript-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  .minimize-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    font-size: 20px;
    line-height: 1;
  }

  .summary-sections {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .summary-section {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #3c4043;
  }

  .edit-button {
    background: none;
    border: none;
    color: #065fd4;
    cursor: pointer;
    font-size: 13px;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .edit-button:hover {
    background-color: rgba(6, 95, 212, 0.1);
  }

  .edit-area {
    width: 100%;
    min-height: 150px;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.6;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
  }

  .edit-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .edit-actions button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  }

  .save-button {
    background-color: #065fd4;
    color: white;
  }

  .cancel-button {
    background-color: #f1f3f4;
    color: #3c4043;
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
        .replace(/\n/g, '<br>');
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
        <div class="summary-sections">
          <div class="summary-section">
            <div class="section-header">
              <div class="section-title">Timeline Breakdown</div>
              <button class="edit-button" data-section="timeline">Edit</button>
            </div>
            <div id="timeline-content"></div>
          </div>
          <div class="summary-section">
            <div class="section-header">
              <div class="section-title">Overall Summary</div>
              <button class="edit-button" data-section="summary">Edit</button>
            </div>
            <div id="summary-content"></div>
          </div>
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

// Add the editing functionality
function createEditableArea(content, section) {
    return `
        <textarea class="edit-area">${content}</textarea>
        <div class="edit-actions">
            <button class="cancel-button">Cancel</button>
            <button class="save-button">Save</button>
        </div>
    `;
}

function setupEditButton(section) {
    const editButton = panel.querySelector(`[data-section="${section}"]`);
    const contentDiv = panel.querySelector(`#${section}-content`);

    editButton.addEventListener('click', () => {
        const currentContent = contentDiv.innerHTML;
        const originalContent = contentDiv.innerHTML;

        contentDiv.innerHTML = createEditableArea(currentContent.replace(/<br>/g, '\n'), section);

        const textarea = contentDiv.querySelector('textarea');
        const saveButton = contentDiv.querySelector('.save-button');
        const cancelButton = contentDiv.querySelector('.cancel-button');

        saveButton.addEventListener('click', () => {
            contentDiv.innerHTML = markdownToHtml(textarea.value);
        });

        cancelButton.addEventListener('click', () => {
            contentDiv.innerHTML = originalContent;
        });
    });
}

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
        const timelinePrompt = `Analyze this video transcript and provide a detailed timeline breakdown. Format your response exactly like this:
# Timeline Breakdown

- [00:00] Introduction of topic
- [MM:SS] Brief description of what happens at this timestamp
- [MM:SS] Another key moment
(continue for all major moments)

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
                model: "llama3-8b-8192",
            }),
            groq.chat.completions.create({
                messages: [{ role: "user", content: summaryPrompt }],
                model: "llama3-8b-8192",
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