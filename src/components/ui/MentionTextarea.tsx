import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { feedService } from '@/services/feedService';
import getCaretCoordinates from 'textarea-caret'; // We need this lib for perfect positioning

interface MentionUser {
    id: string;
    name: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
}

interface MentionTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    onChange: (e: any) => void;
    onMentionSelected?: () => void;
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export function MentionTextarea({ value, onChange, onMentionSelected, className, ...props }: MentionTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [mentionSearchText, setMentionSearchText] = useState<string | null>(null);
    const [cursorIdx, setCursorIdx] = useState<number | null>(null);
    const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
    const [suggestedUsers, setSuggestedUsers] = useState<MentionUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const debouncedSearch = useDebounce(mentionSearchText, 300);

    // Feeds down to the backend on debounce match
    useEffect(() => {
        const fetchUsers = async () => {
            if (debouncedSearch && debouncedSearch.length > 0) {
                setIsSearching(true);
                try {
                    const results = await feedService.searchUsersForMention(debouncedSearch);
                    setSuggestedUsers(results);
                } catch (error) {
                    console.error("Failed fetching users", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestedUsers([]);
            }
        };

        fetchUsers();
    }, [debouncedSearch]);

    // Handle typing and cursor tracking to trigger the dropdown
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const pointer = e.target.selectionStart;
        onChange(e); // Trigger parent update

        // Find the word currently being typed
        const textBeforeCursor = val.slice(0, pointer);
        const match = textBeforeCursor.match(/@(\w*)$/);

        if (match) {
            setMentionSearchText(match[1]);
            setCursorIdx(pointer);

            // Calculate coordinates for the popup
            if (textareaRef.current) {
                const caret = getCaretCoordinates(textareaRef.current, pointer);
                setMentionPosition({
                    top: caret.top + 24, // Push down slightly
                    left: caret.left
                });
            }
        } else {
            setMentionSearchText(null);
            setCursorIdx(null);
            setSuggestedUsers([]);
        }
    };

    const insertMention = (user: MentionUser) => {
        if (!textareaRef.current || cursorIdx === null) return;

        const textBeforeCursor = value.slice(0, cursorIdx);
        const match = textBeforeCursor.match(/@(\w*)$/);

        if (!match) return;

        const actualUsername = user.username || user.name.toLowerCase().replace(/\s+/g, '');
        const insertText = `@${actualUsername} `; // Standardized insert without spaces

        // Split and inject
        const beforeMention = value.slice(0, cursorIdx - match[0].length);
        const afterMention = value.slice(cursorIdx);

        const newValue = `${beforeMention}${insertText}${afterMention}`;

        // Mock a change event mimicking React Synthetic Event
        onChange({ target: { value: newValue } });

        // Reset state
        setMentionSearchText(null);
        setCursorIdx(null);
        setSuggestedUsers([]);

        // Focus back
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                // We rough guess the new cursor pos
                const newPos = beforeMention.length + insertText.length;
                textareaRef.current.setSelectionRange(newPos, newPos);
            }
            if (onMentionSelected) onMentionSelected();
        }, 10);
    };

    return (
        <div className="relative w-full">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                className={className}
                {...props}
            />

            <AnimatePresence>
                {mentionSearchText !== null && (suggestedUsers.length > 0 || isSearching) && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            top: `${mentionPosition.top}px`,
                            left: `${mentionPosition.left}px`,
                            maxWidth: '250px' // constrain drop
                        }}
                        className="z-50 w-64 bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden mt-1 max-h-48 overflow-y-auto"
                    >
                        {isSearching && suggestedUsers.length === 0 ? (
                            <div className="p-3 text-xs text-center text-muted-foreground">Buscando...</div>
                        ) : (
                            <ul className="py-1">
                                {suggestedUsers.map(u => (
                                    <li
                                        key={u.id}
                                        onClick={() => insertMention(u)}
                                        className="h-12 px-3 py-2 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {u.avatar_url ? (
                                                <img src={u.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-primary">{u.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-bold text-foreground truncate">{u.display_name || u.name}</span>
                                            <span className="text-xs text-muted-foreground truncate">@{u.username || u.name.toLowerCase().replace(/\s+/g, '')}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
