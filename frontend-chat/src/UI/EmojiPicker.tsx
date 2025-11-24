import { EmojiPicker } from "frimousse";

interface EmojiData {
    emoji: string;
    name: string;
    category: string;
}

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
}

export const EmojiPickers = ({ onEmojiSelect }: EmojiPickerProps) => {
    return (
        <EmojiPicker.Root className="isolate flex h-[368px] w-fit flex-col bg-gray-800 dark:bg-neutral-900">
            <EmojiPicker.Search
                className="z-10 mx-2 mt-2 mb-2 appearance-none rounded-md  px-2.5 py-2 text-sm  dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search emoji..."
            />
            <EmojiPicker.Viewport className="relative flex-1  outline-none">
                <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center  text-neutral-400 text-sm dark:text-neutral-500">
                   Loading...
                </EmojiPicker.Loading>
                <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
                    Emoji not found.
                </EmojiPicker.Empty>
                <EmojiPicker.List
                    className="select-none pb-1.5"
                    components={{
                        CategoryHeader: ({ category, ...props }: { category: { label: string } } & React.HTMLAttributes<HTMLDivElement>) => (
                            <div
                                className="bg-gray-800 px-3 pt-3 pb-1.5 font-medium text-neutral-400 text-xs dark:bg-neutral-900 dark:text-neutral-500 sticky top-0 z-10"
                                {...props}
                            >
                                {category.label}
                            </div>
                        ),
                        Row: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
                            <div className="scroll-my-1.5 px-1.5" {...props}>
                                {children}
                            </div>
                        ),
                        Emoji: (
                            {
                                emoji,
                                onClick,
                                ...props
                            }: { emoji: EmojiData } & React.ButtonHTMLAttributes<HTMLButtonElement>
                        ) => (
                            <button
                                type="button"
                                className="flex size-8 items-center justify-center rounded-md text-lg hover:bg-neutral-100 active:bg-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title={emoji.name}
                                onClick={(event) => {
                                    onClick?.(event);
                                    if (!event.defaultPrevented) {
                                        onEmojiSelect(emoji.emoji);
                                    }
                                }}
                                {...props}
                            >
                                {emoji.emoji}
                            </button>
                        ),
                    }}
                />
            </EmojiPicker.Viewport>
        </EmojiPicker.Root>
    );
};