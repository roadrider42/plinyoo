// src/lib/__mocks__/supabase.ts
// Manuelle Mocks für Supabase Client - verhindert Hoisting-Probleme

const upload = jest.fn().mockResolvedValue({ error: null });
const remove = jest.fn().mockResolvedValue({ error: null });
const getPublicUrl = jest.fn().mockReturnValue({ 
  data: { publicUrl: "https://cdn/avatars/public/u/avatar.webp" } 
});

const select = jest.fn(() => ({
  eq: jest.fn(() => ({
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}));

const upsert = jest.fn(() => ({
  select: jest.fn(() => ({
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}));

// Exportiere Mock-Funktionen für Assertions
export const __storage = { upload, remove, getPublicUrl };
export const __database = { select, upsert };

export function supabase() {
  return {
    storage: {
      from: () => __storage,
    },
    from: () => __database,
  } as any;
}
