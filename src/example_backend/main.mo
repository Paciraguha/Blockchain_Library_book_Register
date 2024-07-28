import Array "mo:base/Array";
import Time "mo:base/Time";

actor {
  // Define the Book type
  public type Book = {
    id : Nat;
    title : Text;
    author : Text;
    publicationDate : Text;
    isBorrowed : Bool;
    rentUntil : ?Time.Time;
  };

  // State variables
  stable var books : [Book] = [];
  var nextId : Nat = 0;

  // Query function to fetch all books
  public query func getBooks() : async [Book] {
    return books;
  };

  // Function to create a new book
  func createBook(id: Nat, title: Text, author: Text, publicationDate: Text, isBorrowed: Bool, rentUntil: ?Time.Time) : Book {
    {
      id = id;
      title = title;
      author = author;
      publicationDate = publicationDate;
      isBorrowed = isBorrowed;
      rentUntil = rentUntil;
    }
  }

  // Function to add a new book
  public func addBook(title : Text, author : Text, publicationDate : Text) : async () {
    let newBook = createBook(nextId, title, author, publicationDate, false, null);
    books := Array.append<Book>(books, [newBook]);
    nextId := nextId + 1;
  };

  // Function to delete a book by id
  public func deleteBook(id : Nat) : async () {
    let filteredBooks = Array.filter<Book>(books, func(book : Book) : Bool {
      book.id != id
    });
    if (Array.size(filteredBooks) == Array.size(books)) {
      // Handle book not found scenario
      throw Error.reject("Book not found");
    } else {
      books := filteredBooks;
    }
  };

  // Function to update a book by id
  public func updateBook(id : Nat, title : Text, author : Text, publicationDate : Text) : async () {
    var bookFound = false;
    books := Array.map<Book, Book>(books, func(book : Book) : Book {
      if (book.id == id) {
        bookFound := true;
        return createBook(book.id, title, author, publicationDate, book.isBorrowed, book.rentUntil);
      } else {
        return book;
      }
    });
    if (not bookFound) {
      // Handle book not found scenario
      throw Error.reject("Book not found");
    }
  };

  // Function to borrow a book by id
  public func borrowBook(id : Nat, returnDate : Time.Time) : async () {
    var bookFound = false;
    books := Array.map<Book, Book>(books, func(book : Book) : Book {
      if (book.id == id) {
        bookFound := true;
        if (not book.isBorrowed) {
          return createBook(book.id, book.title, book.author, book.publicationDate, true, ?returnDate);
        } else {
          return book;
        }
      } else {
        return book;
      }
    });
    if (not bookFound) {
      // Handle book not found scenario
      throw Error.reject("Book not found or already borrowed");
    }
  };

  // Function to return a book by id
  public func returnBook(id : Nat) : async () {
    var bookFound = false;
    books := Array.map<Book, Book>(books, func(book : Book) : Book {
      if (book.id == id) {
        bookFound := true;
        if (book.isBorrowed) {
          return createBook(book.id, book.title, book.author, book.publicationDate, false, null);
        } else {
          return book;
        }
      } else {
        return book;
      }
    });
    if (not bookFound) {
      // Handle book not found scenario
      throw Error.reject("Book not found or not borrowed");
    }
  };
};
