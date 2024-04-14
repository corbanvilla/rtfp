"use client"

import { useRouter } from 'next/navigation';

import { ChangeEvent, FormEvent } from 'react';
import { useRef, useEffect, useState } from 'react';


const Page = () => {

  const [searchText, setSearchText] = useState<string>('');
  const [placeHolderText, setPlaceHolderText] = useState<string>('Search...');

  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Perform the search
    callSearch();
  };

  const callSearch = () => {
    if (searchText === '')
      return;

    // clear the search text
    setSearchText('');

    router.push(`/search?q=${encodeURI(searchText)}`);
  }

  return (
    <>
      <div >
        {/* Search box */}
        <div className="absolute top-[20vh] left-1/2 transform -translate-x-1/2 -translate-y-1/3 z-[60] placeholder-gray-500 w-4/5 md:w-[700px]">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row items-center justify-center w-full px-4">
              <form onSubmit={handleSearch} className="w-full">
              {/* Full "Search articles and authors..." */}
              <input
                ref={inputRef}
                type="text"
                value={searchText}
                onChange={handleInputChange}
                className="w-full text-2xl bg-transparent focus:outline-none border-gray-300 shadow-sm p-4 font-light"
                placeholder={placeHolderText}
              />
            </form>
            <button onClick={(e) => { callSearch()}} type="submit" className="bg-gray-700 text-white text-lg font-semibold h-12 px-6 ml-4">Go</button>
            </div> 
            <div className="flex items-center border-b-2 border-gray-800 w-full"/>
          </div>
        </div>
        {/* White Background */}
        <div
          className={`fixed inset-0 opacity-95 bg-white h-screen`}
        />
      </div>

    </>
  );
};

export default Page;