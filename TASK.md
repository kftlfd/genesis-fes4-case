Hello future students!

Your goal here is to build an app for managing music tracks.

Feel free to use any libraries, frameworks, tools you like (including design systems and SPA frameworks).

The only thing we require is to avoid asking help from more experienced colleagues - you should be able to explain your code and decisions.

In archive, you could find a NodeJS server providing API's required for the implementation (instructions on how to run it in README.md).

API documentation will be available at http://localhost:8000/documentation).

# Requirements

- [ ] The main page (/tracks), available at `https://localhost:3000` is a list view with a Create Track button.
- [ ] All other views, such as create or edit, should open as modal windows on top of the list.
- [ ] All changes should be saved to the API, and nice loaders should be displayed when necessary.

## Main Tasks

1.  Create a Track (without uploading a file):

    - [x] Open the modal.
    - [x] Create a form to input track metadata (e.g., title, artist, album, genres).
    - [x] A track can have multiple genres (the list is provided by the API). Show genres as tags with an x to remove and a + to add a new one.
    - [x] Implement client-side validation for required fields (e.g., track title, artist name).
    - [x] The form should save the metadata without requiring an actual file upload.
    - [x] Add a field for a cover image link:
      - [x] Validate the image link format.
      - [x] Display a default image for tracks without a cover.
    - [x] Audio file upload should be available as separate flow (Task 3).

2.  Edit Track Metadata:

    - [x] Open Edit Track modal .
    - [x] Create a form to edit the metadata of an existing track (e.g., change the title, artist, or genre).
    - [x] Pre-fill the form with the current metadata of the track when editing.
    - [x] Save modifications to the API.
    - [x] Reflect changes immediately in the list view.

3.  Upload a Track (file):

    - [x] Add functionality to upload a music file (MP3, WAV, etc.) to an existing track (separately from creating and edition).
    - [x] Validate the file type and size to ensure the upload is valid.
    - [x] Add the ability to remove an uploaded file (e.g., to replace it with a higher-quality version).
    - [x] Once uploaded, the file should be playable using the standard HTML audio element.

4.  Delete a Track:

    - [x] Implement a feature to delete a track.
    - [x] Ensure the track is removed both from the list view and from the backend.

5.  List View with Pagination, Sorting, and Filtering:
    - [x] Display all tracks in a list view (with pagination for large data sets).
    - [x] Implement sorting by metadata fields (e.g., sort by track title, artist, or genre).
    - [x] Provide filtering options (e.g., filter by artist or genre).
    - [x] Implement a track search feature with debounce (search by title, artist, and album).
    - [x] Tracks with uploaded files should be playable inline (one at a time).

## Extra Tasks (optional)

- [x] Implement bulk delete functionality (select multiple or all tracks and delete them).
- [ ] Implement optimistic updates to reflect changes in the UI before they are confirmed by the server.
- [ ] Add visualization for the audiowave of currently played track.

# Testability

0.  Application start

    - Application should be runnable on NodeJS version v20.13.1
    - Application start sequence should be:
      - `npm install`
      - `npm start`
    - After the following sequence application should be available at `http://localhost:3000`

1.  Core Element Structure

    All key interactive elements must have appropriate data-testid attributes:

    1. Required data-testid attributes:

    - [ ] `data-testid="tracks-header"` - Main page heading/title
    - [ ] `data-testid="create-track-button"` - Button to create a new track
    - [ ] `data-testid="search-input"` - Search input field
    - [ ] `data-testid="sort-select"` - Sorting control
    - [ ] `data-testid="filter-genre"` - Genre filter control
    - [ ] `data-testid="filter-artist"` - Artist filter control
    - [ ] `data-testid="pagination" -` Pagination container (if pagination is used)
    - [ ] `data-testid="pagination-next"` - Next page button
    - [ ] `data-testid="pagination-prev"` - Previous page button

    2. Track list items:

    - [ ] `data-testid="track-item-{id}"` - Each track item container (where {id} is the track ID)
    - [ ] `data-testid="track-item-{id}-title"` - Track title text
    - [ ] `data-testid="track-item-{id}-artist"` - Track artist text
    - [ ] `data-testid="edit-track-{id}"` - Edit button for a specific track
    - [ ] `data-testid="delete-track-{id}"` - Delete button for a specific track
    - [ ] `data-testid="upload-track-{id}"` - Upload button for a specific track (if applicable)

2.  Form Elements

    All form elements must have appropriate data-testid attributes:

    - [ ] `data-testid="track-form"` - The form container
    - [ ] `data-testid="input-title"` - Title input field
    - [ ] `data-testid="input-artist"` - Artist input field
    - [ ] `data-testid="input-album"` - Album input field
    - [ ] `data-testid="input-cover-image"` - Cover image URL input field
    - [ ] `data-testid="genre-selector"` - Genre selection control
    - [ ] `data-testid="submit-button"` - Form submit button

3.  Validation and Errors

    All validation errors must be identifiable:

    - [ ] `data-testid="error-title"` - Title field error message
    - [ ] `data-testid="error-artist"` - Artist field error message
    - [ ] `data-testid="error-genre"` - Genre field error message

    All other validation errors should follow the pattern `data-testid="error-{fieldname}"`

4.  Dialogs and Notifications

    Confirmation dialogs and notifications must be identifiable:

    - [ ] `data-testid="confirm-dialog"` - Confirmation dialog container
    - [ ] `data-testid="confirm-delete"` - Delete confirmation button
    - [ ] `data-testid="cancel-delete"` - Cancel delete button
    - [ ] `data-testid="toast-container"` - Toast notification container
    - [ ] `data-testid="toast-{type}"` - Specific toast message (where {type} is success, error, etc.)

5.  Loading States

    Loading indicators and states must be identifiable:

    - [ ] `data-testid="loading-indicator"` - Main loading indicator
    - [ ] `data-testid="loading-tracks"` - Loading indicator for the tracks list

    Elements should indicate loading state via `data-loading="true"` attribute

    Disabled elements during loading should use both `disabled` attribute and `aria-disabled="true"`

6.  Audio Player

    Audio player controls should be identifiable:

    - [ ] `data-testid="audio-player-{id}"` - Audio player container for a track
    - [ ] `data-testid="play-button-{id}"` - Play button
    - [ ] `data-testid="pause-button-{id}"` - Pause button
    - [ ] `data-testid="audio-progress-{id}"` - Audio progress indicator

7.  Bulk Operations (if implemented)

    Bulk operation controls should be identifiable:

    - [ ] `data-testid="select-mode-toggle"` - Toggle for selection mode
    - [ ] `data-testid="select-all"` - Select all checkbox
    - [ ] `data-testid="track-checkbox-{id}"` - Checkbox for individual track
    - [ ] `data-testid="bulk-delete-button"` - Button to delete selected tracks

# Submission

- Submit your code as a zip file.
- Include a README file with description of extra tasks done.
- Do not include node_modules or any other unnecessary files (including build artifacts).
- Do not include server code provided by us (we will use our own server for evaluation).
- package.json should be at the root level of the archive

# Evaluation Criteria

- Functionality and adherence to requirements.
- Code quality and organization.
- User experience and design.
- Extra features implemented.
- Testing and error handling.
