# Structure for Game

## Board

- Contains grid (10 x 22 (10x20 visible) )
- Information about "Current Piece", "Hold", and "Next"
  - Contains information about "bag"
- Information about auto lock delay
- Information about DAS (Delay Auto Shift), ARR (Auto Repeat Rate), and Fast Fall Rate
- Information about gravity / falling speed

## Piece

- Contains information about position
- Information about shape
  - Organized in a 3x3 or 5x5 array where center of the array is (0,0) or "Center of rotation"
- Contains information about current rotation and rotation kicks / offsets

# Calculation next frame (I think this is correct)

1. Determine if living.
2. Find current "prefered action(s)". Include gravity if applicablptkrle.
   - If there are no "prefered actions", reset DAS. Go to step 6
3. Compute actions with priority (Hard Drop, Hold), go to step 7
4. Compute Movement.
5. Compute Rotation.
   1. Rotate and translate by rotation kick
   2. Determine if possible
      - If yes, preform action. Go to step 6.
   3. Change rotation kick.
   4. Repeat (go to step 5.1) until there are no more rotation kicks.
6. Determine auto lock.
7. Repeat (Go to step 1).
