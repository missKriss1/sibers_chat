import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface Props {
    onEmojiSelect: (emoji: any) => void;
}

export const EmojiPicker = ({ onEmojiSelect }: Props) => {
    return (
        <Picker
            data={data}
            onEmojiSelect={onEmojiSelect}
            theme="dark"
            perLine={8}
        />
    );
};
