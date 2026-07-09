export interface UserProfileRecord {
  id: string;
  alias: string;
  birth_year: number | null;
  country_code: string | null;
  city: string | null;
  bio: string | null;
  school_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  alias: string;
  birthYear: number | null;
  countryCode: string | null;
  city: string | null;
  bio: string | null;
  schoolName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveUserProfileInput {
  alias: string;
  birthYear: number | null;
  countryCode: string | null;
  city: string | null;
  bio: string | null;
  schoolName: string | null;
}

export function mapUserProfile(record: UserProfileRecord): UserProfile {
  return {
    id: record.id,
    alias: record.alias,
    birthYear: record.birth_year,
    countryCode: record.country_code,
    city: record.city,
    bio: record.bio,
    schoolName: record.school_name,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapUserProfileInput(
  userId: string,
  input: SaveUserProfileInput,
) {
  return {
    id: userId,
    alias: input.alias,
    birth_year: input.birthYear,
    country_code: input.countryCode,
    city: input.city,
    bio: input.bio,
    school_name: input.schoolName,
  };
}
