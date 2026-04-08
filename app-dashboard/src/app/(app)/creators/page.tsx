import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { creators, type Creator } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const statusVariant: Record<
  Creator['status'],
  'default' | 'secondary' | 'destructive'
> = {
  approved: 'default',
  pending: 'secondary',
  suspended: 'destructive',
};

export default function CreatorsPage() {
  return (
    <>
      <PageHeader
        title="Creators"
        description="Manage all creators on the platform."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Creator
        </Button>
      </PageHeader>
      <div className="mb-4">
        <Input placeholder="Search creators..." className="max-w-sm" />
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stripe</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creators.map((creator) => (
              <TableRow key={creator.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={creator.avatar}
                        data-ai-hint="person avatar"
                      />
                      <AvatarFallback>
                        {creator.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{creator.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {creator.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[creator.status]}>
                    {creator.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={creator.stripeOnboarded ? 'default' : 'secondary'}
                  >
                    {creator.stripeOnboarded ? 'Onboarded' : 'Not Onboarded'}
                  </Badge>
                </TableCell>
                <TableCell>{creator.joinedDate}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View profile</DropdownMenuItem>
                      <DropdownMenuItem>View Stripe Onboarding</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Approve</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Suspend
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
