1. **Refactor Backend Session Management (`RaySight-backend/server.js`)**:
   - Make sure `saveUninitialized` is `true`.
   - Add `app.set('trust proxy', 1)` so that secure cookies work behind reverse proxies.
2. **Refactor Frontend Fetch Requests (`RaySight-frontend/src/services/api.ts`)**:
   - In `postPipeline`, remove `sessionId` from the body payload as well.
3. **Verify Changes**:
   - Run the frontend tests and backend tests.
4. **Complete pre commit steps to make sure proper testing, verifications, reviews and reflections are done.**
