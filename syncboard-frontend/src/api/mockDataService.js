// src/api/mockDataService.js

const initialBoard = {
  id: "board-1",
  title: "Website Redesign",
  columns: [
    {
      id: "col-todo",
      title: "To Do",
      position: 1000,
      count: 5,
      color: "gray",
      cards: [
        {
          id: "card-1",
          title: "Create wireframes for landing page",
          label: { text: "Design", color: "blue" },
          comments: 2,
          date: "May 20",
          version: 1,
          assignee: { name: "Sneha Patil", avatarUrl: "https://i.pravatar.cc/150?u=sneha" }
        },
        {
          id: "card-2",
          title: "Setup CI/CD pipeline",
          label: { text: "DevOps", color: "indigo" },
          comments: 0,
          date: "May 22",
          version: 1,
          assignee: { name: "Harshal Moon", avatarUrl: "https://i.pravatar.cc/150?u=harshal" }
        },
        {
          id: "card-3",
          title: "Research user personas",
          label: { text: "Research", color: "orange" },
          comments: 1,
          date: "May 18",
          version: 1,
          assignee: { name: "Ananya Desai", avatarUrl: "https://i.pravatar.cc/150?u=ananya" }
        }
      ]
    },
    {
      id: "col-progress",
      title: "In Progress",
      position: 2000,
      count: 3,
      color: "yellow",
      cards: [
        {
          id: "card-4",
          title: "Implement authentication flow",
          label: { text: "Backend", color: "green" },
          comments: 2,
          date: "May 21",
          version: 1,
          assignee: { name: "Rohit Sharma", avatarUrl: "https://i.pravatar.cc/150?u=rohit" }
        },
        {
          id: "card-5",
          title: "Build responsive navigation bar",
          label: { text: "Frontend", color: "blue" },
          comments: 0,
          date: "May 19",
          version: 1,
          assignee: { name: "Sneha Patil", avatarUrl: "https://i.pravatar.cc/150?u=sneha" }
        }
      ]
    },
    {
      id: "col-review",
      title: "Review",
      position: 3000,
      count: 2,
      color: "blue",
      cards: [
        {
          id: "card-6",
          title: "Homepage UI review",
          label: { text: "Design", color: "blue" },
          comments: 4,
          date: "May 17",
          version: 1,
          assignee: { name: "Ananya Desai", avatarUrl: "https://i.pravatar.cc/150?u=ananya" }
        },
        {
          id: "card-7",
          title: "Code review: Auth module",
          label: { text: "Backend", color: "green" },
          comments: 2,
          date: "May 16",
          version: 1,
          assignee: { name: "Harshal Moon", avatarUrl: "https://i.pravatar.cc/150?u=harshal" }
        }
      ]
    },
    {
      id: "col-done",
      title: "Done",
      position: 4000,
      count: 4,
      color: "green",
      cards: [
        {
          id: "card-8",
          title: "Project setup and environment",
          label: { text: "DevOps", color: "indigo" },
          comments: 0,
          date: null,
          done: true,
          version: 1,
          assignee: { name: "Rohit Sharma", avatarUrl: "https://i.pravatar.cc/150?u=rohit" }
        },
        {
          id: "card-9",
          title: "Database schema design",
          label: { text: "Backend", color: "green" },
          comments: 0,
          date: null,
          done: true,
          version: 1,
          assignee: { name: "Sneha Patil", avatarUrl: "https://i.pravatar.cc/150?u=sneha" }
        }
      ]
    }
  ]
};

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

class MockDataService {
  constructor() {
    this.board = JSON.parse(JSON.stringify(initialBoard)); 
  }

  // eslint-disable-next-line no-unused-vars
  async fetchBoard(boardId) {
    await delay(300);
    return JSON.parse(JSON.stringify(this.board)); 
  }

  // eslint-disable-next-line no-unused-vars
  async moveCard(cardId, sourceColId, targetColId, newPosition) {
    await delay(200);
    return { success: true };
  }

  // eslint-disable-next-line no-unused-vars
  async updateCard(cardId, updates) {
    await delay(300);
    return { success: true, version: (updates.version || 1) + 1 };
  }
}

export const mockApi = new MockDataService();
