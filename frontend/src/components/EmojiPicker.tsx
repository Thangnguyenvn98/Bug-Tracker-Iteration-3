/* eslint-disable @typescript-eslint/no-explicit-any */

import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Smile } from 'lucide-react'
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"



interface EmojiPickerProps {
    onChange: (value:string) => void
}


const EmojiPicker = ({onChange} :EmojiPickerProps) => {
  return (
    <Popover>
        <PopoverTrigger asChild>
            <div className="cursor-pointer absolute bottom-[0.5rem] text-white right-12">
            <Smile />
            </div>
            
        </PopoverTrigger>
        <PopoverContent side="right" sideOffset={40} className="bg-transparent drop-shadow-none shadow-none border-none mb-16">
            <Picker
                data={data}
                onEmojiSelect={(emoji:any) => onChange(emoji.native)}
            />
        </PopoverContent>
    </Popover>
  )
}

export default EmojiPicker