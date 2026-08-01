import Image from 'next/image';
import logoImage from '@/assets/logo.webp';

interface DecantreLogoProps {
  className?: string;
  alt?: string;
}

export const DecantreLogo: React.FC<DecantreLogoProps> = ({
  className = 'h-16 w-16',
  alt = 'Decantre logo',
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={logoImage}
        alt={alt}
        fill
        sizes="100%"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
};
