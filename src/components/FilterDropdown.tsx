'use client'

import { useState } from 'react'
import { Listbox } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'

interface FilterDropdownProps {
  options: string[]
  label: string
  onSelect?: (value: string) => void
}

export default function FilterDropdown({ options = [], label, onSelect }: FilterDropdownProps) {
  const [selected, setSelected] = useState('All')
  const allOptions = ['All', ...(options || [])]

  const handleChange = (value: string) => {
    setSelected(value)
    onSelect?.(value)
  }

  return (
    <Listbox value={selected} onChange={handleChange}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          <span className="block truncate">{selected}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {allOptions.map((option) => (
            <Listbox.Option
              key={option}
              value={option}
              className={({ active }) =>
                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                  active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`
              }
            >
              {option}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  )
} 