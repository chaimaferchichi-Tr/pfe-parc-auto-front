#!/bin/bash

# For each component file, find the @Component decorator and add standalone: false if not already present
for file in $(find src/app -name "*.component.ts"); do
  # Check if it doesn't already have standalone: false
  if ! grep -q "standalone: false" $file; then
    echo "Updating $file"
    # Replace the @Component({ with @Component({ standalone: false, using sed
    sed -i 's/@Component({/@Component({\n  standalone: false,/g' $file
  fi
done
