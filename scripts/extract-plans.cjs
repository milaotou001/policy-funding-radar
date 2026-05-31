const fs = require('fs');
const path = require('path');

const transcriptFile = 'C:/Users/admin/.claude/projects/D--AIProjects-00-workflow-template/4d889ac7-8edb-4537-bda3-7683c947e241.jsonl';
const plansDir = path.join(__dirname, '..', 'data', 'reports', 'plans');

const planConfigs = [
  { city: 'bj', filename: 'bj-15th.txt', startMarker: '北京市国民经济和社会发展' },
  { city: 'nj', filename: 'nj-15th.txt', startMarker: '南京市国民经济和社会发展' },
  { city: 'su', filename: 'su-15th.txt', startMarker: '苏州市国民经济和社会发展' },
];

function extractTextFromContent(content) {
  if (typeof content === 'string') return content;
  if (!content) return '';

  let result = '';
  for (const block of content) {
    if (typeof block === 'string') {
      result += block;
    } else if (block && block.type === 'text' && block.text) {
      result += block.text;
    } else if (block && block.type === 'tool_result' && block.content) {
      // tool_result content can be complex
      if (typeof block.content === 'string') {
        result += block.content;
      } else if (Array.isArray(block.content)) {
        for (const c of block.content) {
          if (typeof c === 'string') result += c;
          else if (c && c.text) result += c.text;
        }
      }
    }
  }
  return result;
}

const content = fs.readFileSync(transcriptFile, 'utf8');
const lines = content.split('\n');

for (const config of planConfigs) {
  console.log(`\n=== Processing ${config.city} ===`);
  let found = false;

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);

      // Check message content (user messages and assistant messages)
      let textContent = '';
      if (obj.message && obj.message.content) {
        textContent = extractTextFromContent(obj.message.content);
      }

      // Also check queue-operation content
      if (!textContent && obj.type === 'queue-operation' && obj.content) {
        textContent = extractTextFromContent(obj.content);
      }

      if (textContent.includes(config.startMarker)) {
        const startIdx = textContent.indexOf(config.startMarker);
        let planText = textContent.substring(startIdx);

        // Clean up JSON escaping
        planText = planText.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

        const outPath = path.join(plansDir, config.filename);
        fs.writeFileSync(outPath, planText, 'utf8');
        console.log(`Saved ${config.filename}: ${planText.length} chars`);
        console.log(`First 100: ${planText.substring(0, 100).replace(/\n/g, ' ')}`);
        console.log(`Last 100: ${planText.substring(Math.max(0, planText.length - 100)).replace(/\n/g, ' ')}`);
        found = true;
        break;
      }
    } catch (e) {
      // skip
    }
  }

  if (!found) {
    console.log(`NOT FOUND: ${config.startMarker}`);
  }
}

console.log('\nDone.');
