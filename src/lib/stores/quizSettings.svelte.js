// Svelte Stores and Reactivity Explained

// Svelte stores provide a way to manage application state that needs to be
// shared across multiple components and reactively update the UI when the state changes.
// They are central to Svelte's reactivity model for shared data.

// The 'quizSettings' object below contains two individual stores created with 'writable()'.
// A 'writable' store holds a value and allows components to subscribe to changes
// and update the value using the .set() and .update() methods.

// How Reactivity Works with Stores in Svelte:

// 1. Importing the store:
//    To use the store in any .svelte file, you first import it:
//    import { quizSettings } from './path/to/this/file.js'; // Adjust the path

// 2. Accessing store values reactively (Automatic Subscription with '$'):
//    Svelte's reactivity system is triggered automatically when a store's value changes.
//    In a .svelte file, you can access the *current* value of a store using the '$' prefix.
//    This special syntax tells Svelte: "I want the current value of this store,
//    and whenever this store's value changes, please update any part of the component
//    that uses this value." This is how Svelte ensures your UI stays in sync with the state.

//    Example (inside a <script> tag of a .svelte file):
//    // This variable will automatically update whenever $quizSettings.freestyle changes
//    $: currentFreestyleMode = $quizSettings.freestyle;
//    // Note the '$:' prefix for reactive declarations in script tags.

//    Example (directly in the HTML template of a .svelte file):
//    // The paragraph content will automatically re-render whenever $quizSettings.gameMode changes
//    <p>Current Mode: {$quizSettings.gameMode === 0 ? 'Casual' : 'Professional'}</p>

// 3. Updating store values (Implementing changes that trigger reactivity):
//    To change the value of a store, you use the store variable itself (without the '$' prefix)
//    and call its methods: `.set()` or `.update()`. When you call these methods,
//    the store's internal value is changed, and this change automatically notifies
//    all components and reactive declarations using the '$' prefix for that store,
//    triggering them to update.

//    Difference between .set() and .update():
//    - `.set(newValue)`: This method replaces the entire current value of the store with `newValue`.
//      You provide the *final* value you want the store to have directly.
//      It's simpler when you know exactly what the new value should be, independent of the old value.
//      Example: store.set(false); // Sets the store's value to exactly false.

//    - `.update(callback)`: This method takes a function (`callback`) as its argument.
//      Svelte calls this function, passing the *current* value of the store to it.
//      Your function then returns the *new* value that the store should have.
//      This is useful when the new value depends on the existing value (e.g., incrementing a number, toggling a boolean, modifying an array or object).
//      Example: store.update(currentValue => !currentValue); // Toggles a boolean value.
//      Example: store.update(currentArray => [...currentArray, newItem]); // Adds an item to an array.

//    Example using .set() (inside a <script> tag of a .svelte file):
//    // Set freestyle mode to false: This call triggers reactivity for $quizSettings.freestyle
//    // We know the exact new value (false) independent of the current value.
//    function disableFreestyle() {
//      quizSettings.freestyle.set(false);
//    }

//    Example using .update() (inside a <script> tag of a .svelte file):
//    // Toggle game mode using the update method: This call triggers reactivity for $quizSettings.gameMode
//    // The new value (1 or 0) depends on the current value.
//    function toggleGameMode() {
//      quizSettings.gameMode.update(currentMode => currentMode === 0 ? 1 : 0);
//    }

//    // These functions would typically be triggered by user interaction (e.g., button clicks)
//    // Example in template:
//    // <button on:click={disableFreestyle}>Go Strict</button>
//    // <button on:click={toggleGameMode}>Switch Mode</button>

// In summary:
// - Stores (`writable`) hold state.
// - `$storeName` syntax in .svelte files enables reactive reading: UI updates when the store changes.
// - `.set(newValue)` and `.update(callback)` methods are used to write to the store, triggering the reactivity.
// - Use `.set()` when you know the exact final value.
// - Use `.update()` when the new value depends on the current value.

import { writable } from "svelte/store";

export const quizSettings = {
  noTimeLimit: writable(true),
  easy: writable(true),
};
