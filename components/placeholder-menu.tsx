"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlusCircle } from "lucide-react"
import { availablePlaceholders } from "@/lib/placeholder-utils"

interface PlaceholderMenuProps {
  onInsert: (placeholder: string) => void
}

export default function PlaceholderMenu({ onInsert }: PlaceholderMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 h-8">
          <PlusCircle className="h-4 w-4 mr-1" />
          <span>Väljad</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Lisa väli</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availablePlaceholders.map((placeholder) => (
          <DropdownMenuItem key={placeholder.key} onClick={() => onInsert(placeholder.key)}>
            <div className="flex flex-col">
              <span className="font-medium">{placeholder.key}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{placeholder.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
