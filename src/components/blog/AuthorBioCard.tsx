import Image from 'next/image';

interface AuthorBioCardProps {
  name: string;
  avatarUrl: string;
  credential?: string;
  bio?: string;
}

export function AuthorBioCard({ name, avatarUrl, credential, bio }: AuthorBioCardProps) {
  return (
    <div
      className="flex gap-4 items-start rounded-[14px] p-5 my-10"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
        <Image src={avatarUrl} alt={name} fill sizes="56px" className="object-cover" />
      </div>
      <div>
        <p className="font-semibold text-lg" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
          {name}
        </p>
        {credential && (
          <p className="text-sm mb-1 font-medium" style={{ color: 'var(--color-primary)' }}>{credential}</p>
        )}
        {bio && <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{bio}</p>}
      </div>
    </div>
  );
}
