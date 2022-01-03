// variable to hold db connection
let db;

// connect to db called budget_tracker
const request = indexedDB.open("budget_tracker", 1);

// this event will emit if the database version changes
request.onupgradeneeded = function(event) {
  // save a reference to the database 
  const db = event.target.result;
  // create an object store (table) called `new_budget`
  db.createObjectStore('new_budget', { autoIncrement: true });
};

// upon successful
request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    // uploadBudget();
  }
}

request.onerror = function(event) {
  console.log(event.target.errorCode);
};