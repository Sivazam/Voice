'use client';

import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DigitalCardProfile } from '@/types/digital-card';
import { downloadVCard } from '@/lib/vcard-utils';

interface AddToContactsProps {
    profile: DigitalCardProfile;
    variant?: 'button' | 'icon';
    className?: string;
}

export function AddToContacts({
    profile,
    variant = 'button',
    className = ''
}: AddToContactsProps) {
    const handleAddToContacts = () => {
        downloadVCard(profile);
    };

    if (variant === 'icon') {
        return (
            <motion.button
                onClick={handleAddToContacts}
                className={`
          w-16 h-16 rounded-full bg-white shadow-xl border-4 border-white
          flex items-center justify-center
          hover:shadow-2xl hover:scale-110 transition-all duration-300
          ${className}
        `}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
            >
                <UserPlus className="w-7 h-7 text-gray-700" />
            </motion.button>
        );
    }

    return (
        <Button
            onClick={handleAddToContacts}
            className={`
        bg-gradient-to-r from-blue-600 to-indigo-600 
        hover:from-blue-700 hover:to-indigo-700 
        text-white font-semibold py-6 px-8 
        rounded-xl shadow-lg shadow-blue-500/25
        ${className}
      `}
        >
            <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <UserPlus className="w-5 h-5" />
                <span>Add to Contacts</span>
            </motion.div>
        </Button>
    );
}
