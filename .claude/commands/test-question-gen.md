# Test Question Generation

Automatically test AI question generation with multiple articles and question types.

## What This Does
1. Generates articles with various keywords
2. Creates questions of specified types
3. Validates answer-explanation consistency
4. Reports pass/fail status

## Usage
```
/test-question-gen [options]
```

## Options
- No arguments: Run full test suite (5 tests)
- `PICK_UNDERLINE`: Test only underline questions
- `GRAMMAR_INCORRECT`: Test only grammar questions
- `all`: Run extended test suite (15+ tests)

## Test Cases

### Default Test Suite
| Keywords | Question Type |
|----------|---------------|
| AI, healthcare | PICK_UNDERLINE |
| climate, technology | PICK_UNDERLINE, PICK_SUBJECT |
| education, digital | PICK_UNDERLINE, GRAMMAR |

## Validation Checks
- `hasUnderline`: `<u>` tags present (PICK_UNDERLINE only)
- `explanationMentionsAnswer`: Answer number in explanation
- `answerMatchesExplanation`: Content consistency
- `choicesAreDistinct`: No duplicate choices

## Running Tests
```bash
# Ensure dev server is running on port 3001 or update API_BASE
node tests/run-validation.js
```

## Arguments
$ARGUMENTS - Question type filter or 'all' for extended tests
