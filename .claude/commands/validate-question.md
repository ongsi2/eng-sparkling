# Question Validation Skill

Validate AI-generated English questions for Korean SAT (수능) format.

## Usage
Run this command after generating questions to verify:
1. Answer-explanation consistency
2. Underline formatting (for PICK_UNDERLINE type)
3. Choice validity and distinctness
4. Overall question quality

## Validation Process

### Step 1: Run Automated Tests
```bash
node tests/run-validation.js
```

### Step 2: Use Codex for Deep Validation
For critical questions, use Codex to verify semantic correctness:
```bash
echo "[QUESTION DETAILS]" | codex exec -m gpt-5-codex --config model_reasoning_effort="medium" --sandbox read-only --full-auto
```

### Step 3: Manual Review Checklist
- [ ] Underlined text exists (for PICK_UNDERLINE)
- [ ] Correct answer matches explanation
- [ ] Explanation mentions answer number
- [ ] All choices are distinct and plausible
- [ ] Korean translations are accurate

## Validation Criteria

| Criteria | PICK_UNDERLINE | GRAMMAR | SUBJECT |
|----------|----------------|---------|---------|
| Has markers | `<u>` tags | ①②③④⑤ | N/A |
| Answer ref | Required | Required | Required |
| Choice format | Korean | ①②③④⑤ | Korean |

## Arguments
- `$ARGUMENTS` - Optional: Question type to focus on (e.g., "PICK_UNDERLINE")
