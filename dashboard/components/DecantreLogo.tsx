import Image from 'next/image';
import logoImage from '@/assets/logo.webp';

interface DecantreLogoProps {
  className?: string;
  alt?: string;
}

export const DecantreLogo: React.FC<DecantreLogoProps> = ({
  className = 'relative h-16 w-16 overflow-hidden',
  alt = 'Decantre logo',
}) => {
  return (
    <div className={className}>
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
