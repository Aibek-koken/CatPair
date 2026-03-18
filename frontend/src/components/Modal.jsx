import Button from './Button';

export default function Modal({ title, isOpen, onClose, children, width = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={`w-full ${width} rounded-3xl bg-white p-6 shadow-soft animate-fadeUp`}>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" onClick={onClose}>
            Закрыть
          </Button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
