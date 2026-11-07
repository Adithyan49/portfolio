
import { createClient } from '@supabase/supabase-js';

// Supabase project configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://rvgknijatdrwgwscxjdv.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_5cc-liiy_QriCS8twW-oLw_Ow0gKiN8';

// Check Supabase configuration
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey
);

// Initialize Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Contact message interface
export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at?: string;
}

// Contact message input interface
export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Safely retrieve locally stored contact messages
function getLocalContactMessages(): ContactMessage[] {
  try {
    if (typeof window === 'undefined') {
      return [];
    }

    const existing = localStorage.getItem(
      'adithyan_contact_messages'
    );

    if (!existing) {
      return [];
    }

    const parsed = JSON.parse(existing);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Could not read local messages:', error);
    return [];
  }
}

// Save a contact message to local storage as a fallback
function saveContactMessageLocally(
  msg: ContactMessageInput,
  createdAt: string
): ContactMessage | null {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    const existing = getLocalContactMessages();

    const newMsg: ContactMessage = {
      ...msg,
      id: 'local_' + Date.now(),
      created_at: createdAt,
    };

    localStorage.setItem(
      'adithyan_contact_messages',
      JSON.stringify([newMsg, ...existing])
    );

    return newMsg;
  } catch (error) {
    console.error('Local storage failed:', error);
    return null;
  }
}

/**
 * Sends a contact message to Supabase.
 *
 * If Supabase is unavailable or the database rejects
 * the request, the message is stored locally instead.
 *
 * Note: This function stores messages in the database.
 * It does not send an email notification.
 */
export async function sendContactMessage(
  msg: ContactMessageInput
): Promise<{
  success: boolean;
  provider: 'supabase' | 'local_storage' | 'unavailable';
  data: ContactMessage[];
  message?: string;
}> {
  const createdAt = new Date().toISOString();

  const messageToSave: ContactMessage = {
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    created_at: createdAt,
  };

  // Attempt to save the message to Supabase
  try {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: messageToSave.name,
          email: messageToSave.email,
          subject: messageToSave.subject,
          message: messageToSave.message,
          created_at: createdAt,
        });

      if (!error) {
        return {
          success: true,
          provider: 'supabase',
          data: [messageToSave],
          message: 'Message successfully saved to the database.',
        };
      }

      console.error(
        'Supabase insert failed:',
        error.message
      );
    }
  } catch (error) {
    console.error(
      'Supabase connection failed:',
      error
    );
  }

  // Use local storage if Supabase saving fails
  const localMessage = saveContactMessageLocally(
    msg,
    createdAt
  );

  if (localMessage) {
    return {
      success: false,
      provider: 'local_storage',
      data: [localMessage],
      message:
        'Message saved only in this browser. It was not saved to Supabase.',
    };
  }

  return {
    success: false,
    provider: 'unavailable',
    data: [],
    message:
      'Unable to save your message. Please try again.',
  };
}

/**
 * Fetches contact messages for the admin dashboard.
 *
 * Supabase Row Level Security must allow the
 * authenticated administrator to read these messages.
 */
export async function fetchContactMessages(): Promise<
  ContactMessage[]
> {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', {
          ascending: false,
        });

      if (!error) {
        return (data ?? []) as ContactMessage[];
      }

      console.error(
        'Supabase message retrieval failed:',
        error.message
      );
    }
  } catch (error) {
    console.error(
      'Error fetching Supabase messages:',
      error
    );
  }

  // Fall back to messages stored in this browser
  return getLocalContactMessages();
}
