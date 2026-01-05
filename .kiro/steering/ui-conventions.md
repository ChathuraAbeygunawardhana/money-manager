# UI Conventions

## Cursor Styles

All interactive elements must have appropriate cursor styles:

- **Clickable elements** (buttons, links, clickable divs): Always include `cursor-pointer` in className
- **Disabled elements**: Use `cursor-not-allowed` when disabled
- **Text inputs**: Default cursor is fine (text cursor)

### Examples

```tsx
// ✅ Good - Button with cursor-pointer
<button className="bg-gray-900 text-white hover:bg-gray-800 cursor-pointer">
  Click me
</button>

// ✅ Good - Link with cursor-pointer
<Link href="/page" className="text-blue-600 hover:underline cursor-pointer">
  Go to page
</Link>

// ✅ Good - Disabled button with cursor-not-allowed
<button 
  disabled 
  className="bg-gray-900 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
>
  Submit
</button>

// ✅ Good - Conditional cursor based on state
<button 
  className={`${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
>
  Action
</button>

// ❌ Bad - Missing cursor-pointer
<button className="bg-gray-900 text-white hover:bg-gray-800">
  Click me
</button>
```

## Modal Dialogs

All modal dialogs must:

- Use `fixed inset-0` to cover the entire viewport
- Add semi-transparent dark overlay: `bg-black bg-opacity-50`
- Center content with `flex items-center justify-center`
- Use high z-index: `z-50`
- Modal content should have white background with shadow for depth

### Modal Structure

```tsx
<div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
  <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-8">
    {/* Modal content */}
  </div>
</div>
```

## Confirmation Dialogs

For destructive operations (delete, remove, etc.), always use a custom confirmation modal instead of browser `confirm()`:

- Show a modal with clear title and description
- Include the item name being affected
- Warn that the action cannot be undone
- Provide Cancel and Confirm buttons
- Use consistent styling with other modals

### Example

```tsx
const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; userId: string; userName: string }>({
  show: false,
  userId: "",
  userName: "",
});

// Modal JSX
{deleteConfirm.show && (
  <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-50">
    <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Delete User</h2>
      <p className="text-gray-600 mb-8">
        Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirm.userName}</span>? This action cannot be undone.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => setDeleteConfirm({ show: false, userId: "", userName: "" })}
          className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
```

## Icon Buttons

Use icons instead of text for edit and delete actions:

- **Edit**: Pen/edit icon (pen with square)
- **Delete**: Trash can icon
- Use grayscale colors for both icons (text-gray-600 hover:text-gray-900)
- Always include `title` attribute for accessibility
- Use SVG icons with proper sizing (typically `h-5 w-5`)

### Example

```tsx
// Edit button
<button
  onClick={handleEdit}
  className="text-gray-600 hover:text-gray-900 cursor-pointer"
  title="Edit item"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
</button>

// Delete button
<button
  onClick={handleDelete}
  className="text-gray-600 hover:text-gray-900 cursor-pointer"
  title="Delete item"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
</button>
```
