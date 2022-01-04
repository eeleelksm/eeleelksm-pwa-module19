// variable to hold db connection
let db;

// connect to db called budget_tracker
const request = indexedDB.open("budget", 1);

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
    uploadBudget();
  }
}

request.onerror = function(event) {
  console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new budget and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions 
  const transaction = db.transaction(['new_budget'], 'readwrite');

  // access the object store for `new_budget`
  const budgetObjectStore = transaction.objectStore('new_budget');

  // add record to your store with add method
  budgetObjectStore.add(record);
}

function uploadBudget() {
  // open a transaction on db
  const transaction = db.transaction(['new_budget'], 'readwrite');

  // access the object store for `new_budget`
  const budgetObjectStore = transaction.objectStore('new_budget');

  // get all records from store and set to a variable
  const getAll = budgetObjectStore.getAll();

  // successful .getAll() execution, run this function
  getAll.onsuccess = function() {
    if(getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(['new_budget'], 'readwrite');
          const budgetObjectStore = transaction.objectStore('new_budget');
          // clear all items in the store
          budgetObjectStore.clear();

          alert("All saved new budgets have been submitted.")
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
};

// listen for app coming back online
window.addEventListener('online', uploadBudget);