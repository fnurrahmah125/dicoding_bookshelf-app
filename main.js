const bookshelf = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return { id, title, author, year, isCompleted };
}

function findBook(bookId) {
  for (const bookItem of bookshelf) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in bookshelf) {
    if (bookshelf[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

/**
 * Fungsi ini digunakan untuk memeriksa apakah localStorage
 * didukung oleh browser atau tidak
 */
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

/*
 * Fungsi ini digunakan untuk menyimpan data ke localStorage
 * berdasarkan KEY yang sudah ditetapkan sebelumnya.
 */
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookshelf);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

/*
 * Fungsi ini digunakan untuk memuat data dari localStorage
 * Dan memasukkan data hasil parsing ke variabel {@see bookshelf}
 */
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      bookshelf.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function createBook(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject;

  const textTitle = document.createElement("h3");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis: ${author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${year}`;

  const container = document.createElement("div");
  container.classList.add("action");

  const greenButton = document.createElement("button");
  greenButton.classList.add("green");

  if (isCompleted) {
    greenButton.innerText = "Belum selesai dibaca";
    greenButton.addEventListener("click", function () {
      undoBookFromCompleted(id);
    });
  } else {
    greenButton.innerText = "Selesai dibaca";
    greenButton.addEventListener("click", function () {
      addBookToCompleted(id);
    });
  }

  const redButton = document.createElement("button");
  redButton.classList.add("red");
  redButton.innerText = "Hapus buku";
  redButton.addEventListener("click", function () {
    let confirmRemove = window.confirm("Anda yakin ingin menghapus buku ini?");
    if (confirmRemove) {
      removeBookFromBookshelf(id);
    }
  });

  const orangeButton = document.createElement("button");
  orangeButton.classList.add("orange");
  orangeButton.innerText = "Edit buku";
  orangeButton.addEventListener("click", function () {
    editBook(id);
  });

  container.append(greenButton, redButton, orangeButton);

  const textContainer = document.createElement("article");
  textContainer.classList.add("book_item");
  textContainer.append(textTitle, textAuthor, textYear, container);

  return textContainer;
}

function addBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const bookIsComplete = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);
  bookshelf.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromBookshelf(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  bookshelf.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const bookTitle = document.getElementById("inputBookTitle");
  const bookAuthor = document.getElementById("inputBookAuthor");
  const bookYear = document.getElementById("inputBookYear");
  const bookIsComplete = document.getElementById("inputBookIsComplete");
  const submitButton = document.getElementById("bookSubmit");

  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTitle.value = bookTarget.title;
  bookAuthor.value = bookTarget.author;
  bookYear.value = bookTarget.year;
  bookIsComplete.checked = bookTarget.isCompleted;
  submitButton.innerText = "Update Buku";

  localStorage.setItem("currentId", bookId);
}

function updateBook() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const bookIsComplete = document.getElementById("inputBookIsComplete").checked;

  const currentId = localStorage.getItem("currentId");
  let bookId = JSON.parse(currentId);

  bookshelf.map((item) => {
    if (item.id === bookId) {
      item.title = bookTitle;
      item.author = bookAuthor;
      item.year = bookYear;
      item.isCompleted = bookIsComplete;
    }
  });

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function searchBook() {
  const titleSearch = document.getElementById("searchBookTitle").value;
  const titleBook = document.querySelectorAll("h3");

  titleBook.forEach((item, index) => {
    const bookItem = document.querySelectorAll(".book_item");
    const title = item.innerText.toLowerCase();

    if (titleSearch !== "") {
      if (!title.includes(titleSearch.toLowerCase())) {
        bookItem[index].style.display = "none";
      }
    } else {
      bookItem[index].style.display = "block";
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  const submitTitle = document.getElementById("searchBook");
  const submitButton = document.getElementById("bookSubmit");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (submitButton.innerText.includes("Update")) {
      submitButton.innerHTML = "Masukkan Buku ke rak <span>Belum selesai dibaca</span>";
      updateBook();
    } else {
      addBook();
    }

    submitForm.reset();
  });

  submitTitle.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log("Data berhasil di simpan.");
});

document.addEventListener(RENDER_EVENT, function () {
  const incompletedBookshelfList = document.getElementById("incompleteBookshelfList");
  const completedBookshelfList = document.getElementById("completeBookshelfList");

  incompletedBookshelfList.innerHTML = "";
  completedBookshelfList.innerHTML = "";

  for (const book of bookshelf) {
    const bookElement = createBook(book);
    if (book.isCompleted) {
      completedBookshelfList.append(bookElement);
    } else {
      incompletedBookshelfList.append(bookElement);
    }
  }
});
