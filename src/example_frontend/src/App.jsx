import React, { useState, useEffect } from 'react';
import './index.scss';
import { IDENTITY_PROVIDER } from "./utils/auth"
function App() {
  const principal = window.auth.principal;
  const isAuthenticated = window.auth.isAuthenticated;
  const [books, setBooks] = useState([]);
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [showUpdateBookForm, setShowUpdateBookForm] = useState(false);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', publicationDate: '' });
  const [currentBook, setCurrentBook] = useState(null);
  const [notification, setNotification] = useState('');

  // only need to validate date and pretty much done
  const signIn = async () => {
    const authClient = window.auth.client;
    // const internetIdentityUrl = process.env.NODE_ENV === 'production'
    //   ? undefined
    //   : IDENTITY_PROVIDER
    await new Promise((resolve) => {
      authClient.login({
        identityProvider: IDENTITY_PROVIDER,
        onSuccess: () => resolve(undefined),
      });
    });
    window.location.reload();
  };

  const signOut = async () => {
    const authClient = await window.auth.client;
    await authClient.logout();
    window.location.reload();
  };


  const fetchBooks = async () => {
    try {
      const booksList = await window.canister.backend.getBooks();
      console.log("Fetched books:", booksList);
      setBooks(booksList);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    }
  };

  const handleAddBook = async (event) => {
    event.preventDefault();
    console.log("Submitting book:", newBook);

    try {
      await window.canister.backend.addBook(newBook.title, newBook.author, newBook.publicationDate);
      console.log("Book added successfully");
      setNotification('Book Registered successfully!');
      setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
      setNewBook({ title: '', author: '', publicationDate: '' });
      setShowAddBookForm(false);
      fetchBooks();
    } catch (error) {
      console.error("Failed to add book:", error);
    }
  };

  const handleUpdateBook = async (event) => {
    event.preventDefault();
    console.log("Updating book:", currentBook);

    try {
      await window.canister.backend.updateBook(currentBook.id, currentBook.title, currentBook.author, currentBook.publicationDate);
      console.log("Book updated successfully");
      setCurrentBook(null);
      setShowUpdateBookForm(false);
      fetchBooks();
    } catch (error) {
      console.error("Failed to update book:", error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this book?');
    if (!confirmDelete) return;

    try {
      await window.canister.backend.deleteBook(bookId);
      console.log("Book deleted successfully");
      fetchBooks();
    } catch (error) {
      console.error("Failed to delete book:", error);
    }
  };

  const handleBorrowBook = async (bookId) => {
    const returnDateStr = prompt("Please enter the return date (YYYY-MM-DD):");
    if (!returnDateStr.trim()) {
      setNotification('Borrowing failed. Enter a valid date!');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    try {
      const returnDate = new Date(returnDateStr).getTime() * 1000000; // Convert to nanoseconds
      if((new Date().getTime() * 1000000) >= returnDate){
        setNotification('Borrowing failed. Please enter a valid future date.');
        setTimeout(() => setNotification(''), 3000);
        return;
      }
      await window.canister.backend.borrowBook(bookId, returnDate);
      console.log("Book borrowed successfully");
      setNotification('Book borrowed successfully!');
      setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
      fetchBooks();
    } catch (error) {
      console.error("Failed to borrow book:", error);
      setNotification('Failed to borrow book.');
      setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
    }
  };

  const handleReturnBook = async (bookId) => {
    try {
      await window.canister.backend.returnBook(bookId);
      console.log("Book returned successfully");
      setNotification('Book returned successfully!');
      setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
      fetchBooks();
    } catch (error) {
      console.error("Failed to return book:", error);
      setNotification('Failed to return book.');
      setTimeout(() => setNotification(''), 3000); // Clear notification after 3 seconds
    }
  };

  const handleViewBooks = () => {
    // Fetch books only if the list is empty or needs to be updated
    if (books.length === 0) {
      fetchBooks();
    }
    setShowAddBookForm(false);
    setShowUpdateBookForm(false); // Ensure update form is closed
    setShowBookDetails(false); // Ensure details view is closed
  };

  const handleEditBook = (book) => {
    setCurrentBook(book);
    setShowUpdateBookForm(true);
    setShowAddBookForm(false); // Close add form if open
    setShowBookDetails(false); // Close details view if open
  };

  const handleViewBook = (book) => {
    setCurrentBook(book);
    setShowBookDetails(true);
    setShowAddBookForm(false); // Close add form if open
    setShowUpdateBookForm(false); // Close update form if open
  };

  const handleShowAddBook = () => {
      setShowAddBookForm(true)
      setShowUpdateBookForm(false);
      setShowBookDetails(false); // Close details view if open
  }

  return (
    <main>
      <h1>Welcome to Library Book Register System</h1>
      {isAuthenticated ? (
        <>
          <button onClick={signOut}>Sign Out</button> &nbsp;&nbsp;
          <button onClick={handleShowAddBook}>Add New Book</button> &nbsp;&nbsp;
          <button onClick={handleViewBooks}>View Books</button>
          <h2>Books Registered in Library are: ({books.length})</h2> {/* Display the count of books */}
          {notification && <p>{notification}</p>} {/* Display notification if present */}
          {!showAddBookForm && !showBookDetails && (
            <table>
              <thead>
                <tr>
                  <th className='th'>Title</th>
                  <th className='th'>Author</th>
                  <th className='th'>Publication Date</th>
                  <th className='th'>Rent Until</th> {/* Add Rent Until column */}
                  <th className='th'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book, index) => (
                  <tr key={index}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.publicationDate}</td>
                    {/* Option types are converted into arrays on the front-end where an empty array represents null */}
                    <td>{book.rentUntil.length ? new Date(Number(book.rentUntil) / 1000000).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <button onClick={() => handleViewBook(book)}>View</button>&nbsp;&nbsp;
                      {book.principal.toString() === principal.toText() ? <>
                        <button onClick={() => handleEditBook(book)}>Edit</button>&nbsp;&nbsp;
                        <button onClick={() => handleDeleteBook(book.id)}>Delete</button>&nbsp;&nbsp;</> : ""}
                      {book.principal.toString() === principal.toText() || book.rentUntil.length ? "" : <><button onClick={() => handleBorrowBook(book.id)}>Borrow</button>&nbsp;&nbsp;</>}
                      {book.borrowedBy.length && book.borrowedBy[0].toString() == principal.toText() ? <button onClick={() => handleReturnBook(book.id)}>Return</button> : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {showAddBookForm && (
            <form onSubmit={handleAddBook}>
              <label>
                Title:
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  required
                />
              </label>
              <label>
                Author:
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  required
                />
              </label>
              <label>
                Publication Date:
                <input
                  type="date"
                  value={newBook.publicationDate}
                  onChange={(e) => setNewBook({ ...newBook, publicationDate: e.target.value })}
                  required
                />
              </label>
              <button type="submit">Save Book</button>
            </form>
          )}
          {showUpdateBookForm && currentBook && (
            <form onSubmit={handleUpdateBook}>
              <label>
                Title:
                <input
                  type="text"
                  value={currentBook.title}
                  onChange={(e) => setCurrentBook({ ...currentBook, title: e.target.value })}
                  required
                />
              </label>
              <label>
                Author:
                <input
                  type="text"
                  value={currentBook.author}
                  onChange={(e) => setCurrentBook({ ...currentBook, author: e.target.value })}
                  required
                />
              </label>
              <label>
                Publication Date:
                <input
                  type="date"
                  value={currentBook.publicationDate}
                  onChange={(e) => setCurrentBook({ ...currentBook, publicationDate: e.target.value })}
                  required
                />
              </label>
              <button type="submit">Update Book</button>
            </form>
          )}
          {showBookDetails && currentBook && (
            <div className="book-details">
              <h2>Book Details</h2>
              <p><strong>Title:</strong> {currentBook.title}</p>
              <p><strong>Author:</strong> {currentBook.author}</p>
              <p><strong>Publication Date:</strong> {currentBook.publicationDate}</p>
              <p><strong>Rent Until:</strong> {currentBook.rentUntil ? new Date(Number(currentBook.rentUntil) / 1000000).toLocaleDateString() : 'N/A'}</p>
              <button onClick={() => setShowBookDetails(false)}>Close</button>
            </div>
          )}
        </>
      ) : (
        <button onClick={signIn}>Sign In</button>
      )}
    </main>
  );
}

export default App;