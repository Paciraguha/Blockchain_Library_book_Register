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
    rentUntil : ?Time.Time; // Add the rentUntil field
  };

  // State variables
  stable var books : [Book] = [];
  var nextId : Nat = 0;

  // Query function to fetch all books
  public query func getBooks() : async [Book] {
    return books;
  };

  // Function to add a new book
  public func addBook(title : Text, author : Text, publicationDate : Text) : async () {
    let newBook : Book = {
      id = nextId;
      title = title;
      author = author;
      publicationDate = publicationDate;
      isBorrowed = false;
      rentUntil = null; // Initialize rentUntil as null
    };
    books := Array.append<Book>(books, [newBook]);
    nextId := nextId + 1;
  };

  // Function to delete a book by id
  public func deleteBook(id : Nat) : async () {
    books := Array.filter<Book>(books, func(book : Book) : Bool {
      book.id != id
    });
  };

  // Function to update a book by id
  public func updateBook(id : Nat, title : Text, author : Text, publicationDate : Text) : async () {
    books := Array.map<Book, Book>(books, func(book : Book) : Book {
      if (book.id == id) {
        return {
          id = book.id;
          title = title;
          author = author;
          publicationDate = publicationDate;
          isBorrowed = book.isBorrowed; // Keep the current borrow status
          rentUntil = book.rentUntil; // Keep the current rentUntil date
        };
      } else {
        return book;
      }
    });
  };

  // Function to borrow a book by id
  public func borrowBook(id : Nat, returnDate : Time.Time) : async () {
    books := Array.map<Book, Book>(books, func(book : Book) : Book {
      if (book.id == id) {
        if (not book.isBorrowed) {  // Use not for negation
          return {
            id = book.id;
            title = book.title;
            author = book.author;
            publicationDate = book.publicationDate;
            isBorrowed = true;
            rentUntil = ?returnDate; // Set rentUntil date
          };
        } else {
          return book;
        }
      } else {
        return book;
      }
    });
  };

  // Function to return a book by id
  public func returnBook(id : Nat) : async () {
    books := Array.map<Book, Book>(books, func(book : Book) : Book {
      if (book.id == id) {
        if (book.isBorrowed) {
          return {
            id = book.id;
            title = book.title;
            author = book.author;
            publicationDate = book.publicationDate;
            isBorrowed = false;
            rentUntil = null; // Clear rentUntil date
          };
        } else {
          return book;
        }
      } else {
        return book;
      }
    });
  };

};