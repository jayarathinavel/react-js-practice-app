import api from "../api/api"

/**
 * Creates tasks in the task manager from parsed todo entries
 * @param {string} todoText - The todo text from worklog
 * @returns {Promise<Array>} - Array of created tasks
 */
export async function createTasksFromWorklog(todoText, worklogId) {
  const parsedTasks = parseTasksFromTodo(todoText)
  const createdTasks = []

  for (const task of parsedTasks) {
    try {
      const res = await api.post("/task-manager", {
        title: task.title,
        description: task.description,
        reference: "worklog-" + worklogId,
      })
      createdTasks.push(res.data)
    } catch (err) {
      console.error(`Failed to create task "${task.title}":`, err.response?.data?.message || err.message)
      // Continue creating other tasks even if one fails
    }
  }

  return createdTasks
}

/**
 * Parses todo entries from markdown/text format and extracts tasks
 * Handles:
 * - Single line entries
 * - Unordered lists (-, *, •)
 * - Ordered lists (1., 2., etc.)
 * Top-level items become task titles, nested items become descriptions
 */
export function parseTasksFromTodo(todoText) {
  if (!todoText || !todoText.trim()) return []

  const tasks = []
  const lines = todoText.split("\n").filter((line) => line.trim())

  if (lines.length === 0) return tasks

  // Check if it's a list (contains list markers)
  const hasListMarkers = lines.some((line) => {
    const trimmed = line.trim()
    return /^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)
  })

  if (!hasListMarkers) {
    // Single line or simple text - treat as single task
    if (lines.length === 1) {
      return [{ title: lines[0].trim(), description: "" }]
    }
    // Multiple lines without markers - join them as description for single task
    return [{ title: lines[0].trim(), description: lines.slice(1).join("\n") }]
  }

  // Parse as list
  let currentTask = null
  let currentIndent = -1

  for (const line of lines) {
    if (!line.trim()) continue

    const indent = line.search(/\S/) // Find first non-whitespace
    const trimmed = line.trim()

    // Check if this is a list item
    const unorderedMatch = trimmed.match(/^[-*•]\s+(.+)$/)
    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/)
    const listContent = unorderedMatch?.[1] || orderedMatch?.[1]

    if (listContent !== undefined) {
      if (currentIndent === -1 || indent <= currentIndent) {
        // Top-level item - save previous task and start new one
        if (currentTask) {
          tasks.push(currentTask)
        }
        currentTask = {
          title: listContent,
          description: "",
        }
        currentIndent = indent
      } else {
        // Nested item - add to description
        if (currentTask) {
          if (currentTask.description) {
            currentTask.description += "\n"
          }
          currentTask.description += "- " + listContent
        }
      }
    }
  }

  // Don't forget the last task
  if (currentTask) {
    tasks.push(currentTask)
  }

  return tasks
}

/**
 * Formats markdown text for clipboard with proper bullets and emojis
 * Converts markdown list items to plain text with bullets while preserving indentation (tabs)
 * @param {string} text - The markdown text to format
 * @param {Array} tasks - Optional array of tasks to include status emojis
 * @returns {string} - Formatted text for clipboard
 */
export function formatMarkdownForClipboard(text, tasks = []) {
  if (!text || !text.trim()) return ""

  const lines = text.split("\n")
  const formattedLines = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      formattedLines.push("")
      continue
    }

    // Extract leading whitespace (preserve tabs and spaces as-is)
    const leadingWhitespaceMatch = line.match(/^(\s*)/)
    const indentStr = leadingWhitespaceMatch ? leadingWhitespaceMatch[1] : ""
    const indent = line.search(/\S/)

    // Check for unordered list markers (-, *, •)
    const unorderedMatch = trimmed.match(/^[-*•]\s+(.+)$/)
    if (unorderedMatch) {
      const content = unorderedMatch[1]
      
      // Check if this task has a status emoji (only for top-level items)
      let emoji = ""
      if (tasks.length > 0 && indent === 0) {
        const task = tasks.find(t => {
          const normalizedTaskTitle = t.title.trim().toLowerCase()
          const normalizedContent = content.trim().toLowerCase()
          return normalizedTaskTitle === normalizedContent
        })
        
        if (task) {
          switch (task.status?.toLowerCase()) {
            case "completed":
              emoji = " ✅"
              break
            case "in-progress":
              emoji = " 🚧"
              break
            case "pending":
            case "todo":
              emoji = " ⏳"
              break
            case "cancelled":
              emoji = " ❌"
              break
          }
        }
      }
      
      formattedLines.push(`${indentStr}- ${content}${emoji}`)
      continue
    }

    // Check for ordered list markers (1., 2., etc.)
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/)
    if (orderedMatch) {
      const number = orderedMatch[1]
      const content = orderedMatch[2]
      formattedLines.push(`${indentStr}${number}. ${content}`)
      continue
    }

    // Regular text - preserve original line with indentation
    formattedLines.push(line)
  }

  return formattedLines.join("\n")
}
