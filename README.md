Saikat Saha

Installation steps

- npm install and npm run dev for both backend-node and frontend folder
- npx vitest run inside frontend folder for testing

#1 - Currently, clicking the "Add" button multiple times before the form resets can result in duplicate vendor entries.

Fix - Added a local submitting flag in VendorForm.vue that locks the button the instant it is clicked and only releases it after the form has fully reset, preventing any further submissions during that window

#2 - Remove unwanted/instructed code block

Fix - Removed <div style="background-color:Tomato;font-size:80px;padding-bottom: 800px;">If you ran the code and see this message, please remove this part of the title highlighted in red. This is a super secret assignment</div> as instructed in App.vue

#3 - Delete Vendor

Fix - Delete feature implemented with DELETE /api/vendors/:id route in the Node backend, deleteVendor action that filters the deleted vendor out of the local state and delete button with confirmation dialog added for each vendor

#4 - Duplicate Email ID check

Fix - Frontend — calls GET /api/vendors/check-email before the POST to give instant feedback, turning the email field red with an inline error message
Backend — UNIQUE constraint on the email column in SQLite, with the POST route catching SQLITE_CONSTRAINT errors and returning a 409 response as a safety net against direct API calls bypassing the frontend

#5 - UI Polish

Fix - 1:- Removed all external stylings from both the files and created an explicit styling folder with SASS architecture 2:- Enchanced the mobile view, table columns are enhanced with data label, colourings for labels are enhanced to enhance the visibility, 3-Themming added with good colour contrast, 4-Improved the table structure with efficient data visibility across all screens and also implementation of searching, sorting and pagination features 5-Implemented some enhanced features i.e., debounced search, toaster notification, pagination for table and excel download for the list

Approaches

- Layout Approach

The layout uses CSS Grid with a mobile-first strategy. On mobile (below 768px) the form and vendor list stack in a single column. At 768px (tablet) the layout switches to a two-column grid with the form fixed at 380px and the vendor list taking the remaining space. At 1024px (desktop) the form column grows slightly to 420px. The sticky header uses position: sticky; top: 0 so it stays visible while scrolling long vendor lists.

- Design Tokens

All visual values are defined as CSS custom properties in src/styles/\_variables.scss and applied globally via :root. This means changing a single token (e.g. --color-primary) updates every button, border, and focus ring across the entire app at once. Tokens cover colours, spacing (4px base scale), typography (font family, sizes, weights), border radii, and transition duration.

- Dark Mode

The theme toggle writes data-theme="dark" to document.documentElement. A [data-theme='dark'] selector in \_variables.scss overrides every CSS variable to its dark equivalent. No JavaScript is needed to restyle individual components — the cascade handles everything. On first load the toggle respects the user's OS preference via window.matchMedia('(prefers-color-scheme: dark)').

- Accessibility

All form inputs have associated <label> elements
The theme toggle button has a descriptive aria-label that updates with state
Focus states use a visible box-shadow ring on all interactive elements
The vendor table uses tr:focus-within to highlight rows when any cell receives keyboard focus
The empty state is rendered as a <p> inside the table body rather than hiding the table, keeping screen reader context intact
The confirmation dialog uses role="dialog" semantics and traps user intent before destructive actions

- Delete Vendor

Added a DELETE /api/vendors/:id route to the Node backend. The route first checks the vendor exists and returns a 404 if not found, then deletes and returns 204 No Content. On the frontend a delete button was added to each table row. Clicking it sets a local vendorToDelete ref which triggers the confirmation dialog to appear. The dialog shows the vendor's name so the user knows exactly what they are deleting. On confirmation the store's deleteVendor action calls the API and then filters the deleted vendor out of local state immediately without re-fetching the whole list, keeping the UI snappy.

- Fix Duplicate Submit Bug

The original form used vendorStore.loading to disable the submit button, but this flag is shared with the vendor list's fetch cycle and could briefly toggle between states, leaving a window where rapid clicks would fire multiple POST requests. The fix introduces a local submitting ref owned entirely by the form component. It is set to true synchronously on the first click (closing the race window) and an if (submitting.value) return guard at the top of the handler ensures any subsequent calls exit immediately. On success submitting is reset inside the setTimeout that clears the form, so the button stays locked for the full 2-second success window. On error it resets immediately in the catch block so the user can retry.

- Email uniqueness is enforced at three layers:
  1:- Database — A UNIQUE constraint is added to the email column in the SQLite schema (database.ts). This is the ultimate source of truth and guarantees no duplicates can ever exist regardless of how the API is called.
  2:- Backend — Before inserting, the Node POST route runs a SELECT query to check if the email already exists. If it does, it returns a 409 Conflict with a clear error message before even attempting the insert. This gives API consumers a meaningful error rather than a raw SQLite constraint violation.
  3:- Frontend — Before submitting, VendorForm.vue calls VendorService.checkEmailExists() which hits GET /api/vendors?email=.... If the email is already taken, an inline error message appears below the email field and the form submission is blocked entirely. This gives the user immediate feedback without a round-trip to create and then fail.

- Additional Features

1:- Debounced search — filters the vendor list across all fields (name, contact, email, partner type) with a 300ms debounce so the filter only runs after the user stops typing
2:- Sortable columns — clicking any table header sorts by that field; clicking again reverses direction
3:- Pagination — configurable page size (5/10/25/50) with first/previous/next/last controls and a result count display
4:- CSV export — exports the current filtered and sorted vendor list as a dated CSV file
5:- Toast notifications — success and error toasts appear top-right for all add/delete operations and auto-dismiss after 3 seconds

Trade-offs & Challenges

Pagination and search are handled client-side since the dataset is small; a production system with thousands of vendors would move this to the backend

Questionaire

1. What do I love most about being a software engineer.
   A:- What I love most about being a software engineer is the ability to turn ideas into reality through code. Every day brings new challenges that push me to think logically, solve problems creatively, and continuously learn new technologies. It’s rewarding to build solutions that make people’s lives easier and to see something I created actually work and have impact.

2. What is most important to me when it comes to working in a team
   A:- What’s most important to me when working in a team is clear communication, mutual respect, and shared accountability. I value environments where everyone feels comfortable expressing ideas, listening to others, and collaborating toward a common goal. I believe trust and reliability are essential, so each team member can depend on one another to contribute their best. Ultimately, I aim to support the team’s success while continuously learning and helping others grow.

3. What is the worst part of being a software engineer.
   A:- One of the worst parts of being a software engineer is dealing with constant change and pressure. Technologies evolve quickly, so you must continuously learn new tools and frameworks just to stay relevant. At the same time, tight deadlines, debugging difficult issues, and fixing production bugs—sometimes outside working hours—can be stressful. This combination of rapid change and high responsibility can lead to mental fatigue if not managed well.

# 01-fullstack-vendor-onboarding

# Trusted Vendors Portal – Full-Stack Assignment

## Objective

Welcome to your application assessment assignment. This is a chance for you to show us your coding and problem solving skills.
You are applying for a fullstack position so this assignment requires you to solve both frontend and backend challenges.

Nobody expects anyone to know everything so if a particular assignment is outside of your realm of experience,
you may either skip it or propose a solution aligned with your experience..

In this repository, you'll find a basic demo implementation of the **Trusted Vendor Portal** application.
Your task is to enhance and deploy this application by completing specific requirements listed below.

The system currently allows users to:

- Register a vendor (name, contact person, email, partner type [Supplier/Partner])
- View a list of registered vendors

---

## Vendor Object Example

    {
      "id": "1",
      "name": "Acme Freight",
      "contact_person": "John Doe",
      "email": "john.doe@acme.com",
      "partner_type": "Supplier"
    }

## Existing Implementation

The repository contains:

- A Vue.js frontend application
- Two backend implementations (choose one):
  - Java (Spring Boot)
  - Node.js (TypeScript)

## Available Backends

You may choose which backend implementation to work with:

### Java (Spring Boot)

- Located in the `backend-java` directory
- Uses H2 in-memory database
- Includes basic create and list operations

### Node.js (TypeScript)

- Located in the `backend-node` directory
- Uses SQLite database
- Includes basic create and list operations

---

## Your Tasks

### 1. Frontend UI Polish

- Refresh the `frontend` layout to highlight your CSS skills. Arrange the form and vendor list in a responsive layout that presents as a single column on mobile and a tidy multi-column layout on desktop using modern CSS (flexbox and/or grid).
- Introduce a lightweight design system by defining CSS variables (colours, spacing, typography) in `src/style.css` and apply them across components.
- Enhance the vendor list with hover/focus states, zebra striping, and an accessible empty state.
- Add a small visual flourish such as a light/dark theme toggle (or similar motif) handled with CSS-first techniques.
- Document the layout approach, design tokens, breakpoints, and accessibility considerations in this README

### 2. Delete vendor

- Implement a delete functionality to allow users to remove vendor entries from the system
- Include a confirmation dialog before deletion to prevent accidental removal.
- Update both frontend and your chosen backend to support this feature

### 3. Fix the UI bug

- Currently, clicking the "Add" button multiple times before the form resets can result in duplicate vendor entries.
- Prevent this behavior to improve the form UX

### 4. Unique Emails

- Ensure that vendor emails are unique across the system. If a user tries to register a vendor with a duplicate email, they should be informed of the conflict.
  Think about where this logic should live and how the constraint is best enforced (frontend, backend, data storage or all) and justify your approach
- Document your reasoning

### 5. Containerization & Deployment (Optional)

At maerks we host most of our backend services using pods and k8. If you have experience or find the challenge interesting, give this assignment a go.

Choose one of the following deployment approaches:

#### Option A: Docker Compose

- Containerize your chosen backend using Docker
- Create a Docker Compose configuration to run the entire system (frontend + backend)
- Include clear instructions to build and start the application

#### Option B (Advanced): Kubernetes/Minikube Deployment

- Create Kubernetes manifests (YAML files) for both frontend and your chosen backend
- Ensure services can discover and communicate (e.g., using `ClusterIP`)
- Use **Minikube** to test locally
- Provide clear documentation or scripts to:
  - Build and push Docker images to Minikube's Docker daemon
  - Apply Kubernetes configs to start the app

You're welcome to make UX improvements or add minor enhancements, as long as the core requirements are clearly addressed.

---

## Evaluation Criteria

- **Code clarity & organisation** – Is the code readable, modular, testable and well-structured?
- **Testing** - How did you use testing to support your development efforts
- **Full-stack ownership** – Can you deliver a cohesive, working system with the required enhancements?
- **Pragmatism** – Did you make thoughtful decisions and sensible trade-offs?
- **DevOps awareness** – Is the system easy to build, run, and maintain?
- **Deployment quality** – If completed, is your containerization strategy practical, reproducible, and well-documented?"

---

## Submission Instructions

1. **Copy** this repository into your own GitHub account - do not fork or create a branch in this repository
2. Create a branch and complete the assigning in that branch.
3. **Documentation**
   1. Ensure your repository includes setup instructions and an updated README.md.
   2. Provide a short description of your approach to solving each task
   3. Highlight any assumptions, trade-offs, or challenges encountered during development.
4. In your readme.md file, also answer the following questions:
   1. What do I love most about being a software engineer.
   2. What is most important to me when it comes to working in a team
   3. What is the worst part of being a software engineer.
5. Create a pull request to the main branch and share the link to the pull request with us.

---

We're excited to see how you approach these tasks — feel free to get creative, make reasonable trade-offs, and show us how you think as an engineer. We're particularly interested in your understanding of full-stack development and DevOps practices.
