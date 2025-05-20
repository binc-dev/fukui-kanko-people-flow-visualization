import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { localDefaultStars } from "@/lib/default";
import { TrashIcon } from "@primer/octicons-react";

interface Props {
  title: string;
  removeStar: (title: string) => void;
}

export function DeleteDialogTrigger({ title, removeStar }: Props) {
  const { removeDefaultStar, getDefaultTitle } = localDefaultStars();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="shrink-0" variant="destructive" size="icon">
          <TrashIcon size="small" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center">お気に入りの削除</DialogTitle>
          <DialogDescription className="text-center text-black">
            「{title}」をお気に入りから削除しますか？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="transition-all mx-auto w-fit"
            variant="destructive"
            onClick={() => {
              if (title === getDefaultTitle()) {
                removeDefaultStar();
              }
              removeStar(title);
            }}
          >
            削除する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
