import { ButtonLink, Container, Label } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-24">
      <Label>404</Label>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page doesn&apos;t exist.</h1>
      <div className="mt-6">
        <ButtonLink href="/" variant="primary">
          Back home
        </ButtonLink>
      </div>
    </Container>
  );
}
