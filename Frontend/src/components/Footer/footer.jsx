import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">cinépolis</h3>
            <p className="text-gray-400">Experience the magic of cinema with us.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">Quick Links</h4>
            <ul className="space-y-2">
              {['Movies', 'Experiences', 'VIP', 'Book', 'Club Movies', 'Offers'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">Contact Us</h4>
            <p className="text-gray-400">123 Cinema Street</p>
            <p className="text-gray-400">Ahmedabad, Gujarat 380001</p>
            <p className="text-gray-400">Phone: (123) 456-7890</p>
            <p className="text-gray-400">Email: info@cinepolis.com</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">Follow Us</h4>
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                <a
                  key={social}
                  href={`https://${social}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                >
                  <span className="sr-only">{social}</span>
                  <i className={`fab fa-${social} text-2xl`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} cinépolis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
    