import Button from "./Button";

interface FooterProps {
  onPreviousClick: () => void;
  onNextClick: () => void;
  previousDisabled: boolean;
  nextDisabled: boolean;
}

const Footer = ({
  onPreviousClick,
  onNextClick,
  previousDisabled,
  nextDisabled,
}: FooterProps) => {
  return (
    <div className="flex justify-center flex-initial bg-blue-400 text-blue-900 p-4 text-lg">
      <Button
        title="Previous"
        disabled={previousDisabled}
        onClick={onPreviousClick}
      />
      <div className="p-4"></div>
      <Button title="Next" disabled={nextDisabled} onClick={onNextClick} />
    </div>
  );
};

export default Footer;
