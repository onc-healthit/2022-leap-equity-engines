export type AwaitProps<T> = {
  promise: Promise<T>;
  children: (promiseResult: T) => JSX.Element;
};

export default async function Await<T>({ promise, children }: AwaitProps<T>) {
  const result = await promise;
  return children(result);
}
