import Array "mo:base/Array";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Bool "mo:base/Bool";

actor class () {

  // Define the Book type
  public type Book = {
    id : Nat;
    title : Text;
    author : Text;
    principal : Principal;
    borrowedBy : ?Principal;
    publicationDate : Text;
    isBorrowed : Bool;
    rentUntil : ?Time.Time; // Add the rentUntil field
  };
  public type Result<Ok, Err> = Result.Result<Ok, Err>;

  // State variables
  stable var books : [Book] = [];
  var nextId : Nat = 0;

  // Query function to fetch all books
  public query func getBooks() : async [Book] {
    return books;
  };

  // Function to add a new book
  public shared ({ caller }) func addBook(title : Text, author : Text, publicationDate : Text) : async Text {
    let newBook : Book = {
      id = nextId;
      title = title;
      author = author;
      principal = caller;
      borrowedBy = null;
      publicationDate = publicationDate;
      isBorrowed = false;
      rentUntil = null; // Initialize rentUntil as null
    };
    books := Array.append<Book>(books, [newBook]);
    nextId := nextId + 1;
    return "Successfully added book!";
  };

  // Function to delete a book by id
  public shared ({ caller }) func deleteBook(id : Nat) : async Result<Text, Text> {
    let book = Array.find<Book>(
      books,
      func(book : Book) : Bool {
        book.id == id;
      },
    );
    switch (book) {
      case (null) { return #err("Book not found.") };
      case (?book) {
        if (book.principal != caller) {
          return #err("Only the principal of the book can delete it.");
        };
        books := Array.filter<Book>(
          books,
          func(book : Book) : Bool {
            book.id != id;
          },
        );
        return #ok(
          "Successfully deleted book!"
        );
      };
    };
  };

  // Function to update a book by id
  public shared ({ caller }) func updateBook(id : Nat, title : Text, author : Text, publicationDate : Text) : async Result<Text, Text> {
    var updated : Bool = false;
    books := Array.map<Book, Book>(
      books,
      func(book : Book) : Book {
        if (book.id == id and caller == book.principal) {
          updated := true;
          return {
            id = book.id;
            title = title;
            author = author;
            principal = book.principal;
            borrowedBy = book.borrowedBy;
            publicationDate = publicationDate;
            isBorrowed = book.isBorrowed; // Keep the current borrow status
            rentUntil = book.rentUntil; // Keep the current rentUntil date
          };
        } else {
          return book;
        };
      },
    );
    if (not updated) {
      return #err("Failed to update book!");
    };
    return #ok("Successfully updated book!");
  };

  // Function to borrow a book by id
  public shared ({ caller }) func borrowBook(id : Nat, returnDate : Time.Time) : async Result<Text, Text> {
    var borrowed : Bool = false;
    books := Array.map<Book, Book>(
      books,
      func(book : Book) : Book {
        if (book.id == id) {
          if (not book.isBorrowed) {
            // Use not for negation
            borrowed := true;
            return {
              id = book.id;
              title = book.title;
              author = book.author;
              principal = book.principal;
              borrowedBy = ?caller;
              publicationDate = book.publicationDate;
              isBorrowed = true;
              rentUntil = ?returnDate; // Set rentUntil date
            };
          } else {
            return book;
          };
        } else {
          return book;
        };
      },
    );
    if (not borrowed) {
      return #err("Failed to update book!");
    };
    return #ok("Successfully updated book!");
  };

  // Function to return a book by id
  public func returnBook(id : Nat) : async Result<Text, Text> {
    var returned : Bool = false;
    books := Array.map<Book, Book>(
      books,
      func(book : Book) : Book {
        if (book.id == id) {
          if (book.isBorrowed) {
            returned := true;
            return {
              id = book.id;
              title = book.title;
              author = book.author;
              principal = book.principal;
              borrowedBy = null;
              publicationDate = book.publicationDate;
              isBorrowed = false;
              rentUntil = null; // Clear rentUntil date
            };
          } else {
            return book;
          };
        } else {
          return book;
        };
      },
    );
    if (not returned) {
      return #err("Failed to update book!");
    };
    return #ok("Successfully updated book!");
  };
};
