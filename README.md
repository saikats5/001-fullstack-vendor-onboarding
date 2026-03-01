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
