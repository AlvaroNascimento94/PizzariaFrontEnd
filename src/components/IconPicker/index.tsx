'use client'
import styles from "./iconPicker.module.scss"

interface IconPickerProps {
    selectedIcon?: string;
    onSelect: (iconName: string) => void;
}

export function IconPicker({ selectedIcon, onSelect }: IconPickerProps) {

    const emojis = [
        "🍕", "🍰","🍮",
        "🥗", "🍔", "🍟", "🌭", "🌮",
        "🍝", "🍗", "🥩", "🦐", "🐟",
        "☕", "🍺", "🍷","🥤"
    ];

    function handleSelectIcon(emoji: string) {
        onSelect(emoji);
    }

    return (
        <div className={styles.container}>
            <label>Ícone da Categoria</label>

            <div className={styles.iconScrollGrid}>
                {emojis.map((emoji) => {
                    const isSelected = emoji === selectedIcon;
                    return (
                        <button
                            key={emoji}
                            type="button"
                            className={`${styles.iconButton} ${isSelected ? styles.selected : ""}`}
                            onClick={() => handleSelectIcon(emoji)}
                            title={emoji}
                        >
                            <span style={{ fontSize: '28px' }}>{emoji}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
