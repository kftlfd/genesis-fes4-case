# Genesis Frontend School 4 test case

CRUD music player app with listing tracks, sorting, filtering, pagination, audio playback and visualisation.

## Backend

Backend is in the `backend` git branch. It can be used from a separate git worktree:

```sh
git worktree add ../gfes4-backend backend
```

## Run

Add `.env.local` file, update as needed

```sh
cp .env.example .env.local
```

Install dependencies

```sh
npm i
```

Run in dev-mode

```sh
npm run dev
```

or make a production build

```sh
npm run build
npm run start
```

## Extra Tasks done (optional)

- [x] Implement bulk delete functionality (select multiple or all tracks and delete them).
- [x] Implement optimistic updates to reflect changes in the UI before they are confirmed by the server. -- only for editing tracks, removing uploads, and deleting tracks (create track and add upload still require server confirmation)
- [x] Add visualization for the audiowave of currently played track.
