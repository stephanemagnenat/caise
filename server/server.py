#!/usr/bin/env python3.6

# inspired from https://websockets.readthedocs.io/en/stable/intro.html
# WS server example

import asyncio
import json
import logging
import websockets
import time
import numpy as np

from numpy.linalg import norm
from constants import *
from utils import *
from gameobjects import *

# enable logging

logging.basicConfig(level=logging.DEBUG)

# game state

class GameState:
	def __init__(self):
		self.players = {}
		self.boxes = {}
		self.bullets = {}
		self.ball = Ball(0)
		self.next_gameobject_id = 1

state = GameState()

## message building

def message_object_new(gameobject):
	message = gameobject.get_json_state(True)
	message['type'] = 'object_new'
	return json.dumps(message)

def message_object_status(gameobject):
	message = gameobject.get_json_state(False)
	message['type'] = 'object_state'
	return json.dumps(message)

def message_object_part(gameobject):
	return json.dumps({'type': 'object_part', 'id': gameobject.id})

def message_player_welcome(player):
	return json.dumps({'type': 'player_welcome', 'id': player.id})

## notification helper methods

async def notify_players(source_player, messager_builder_function):
	if state.players:       # asyncio.wait doesn't accept an empty list
		message = messager_builder_function(source_player)
		await asyncio.wait([websocket.send(message) for websocket in state.players])

## network processing callbacks

async def register(websocket):
	# receive the name from this player
	name = await websocket.recv()
	# TODO: check for name duplications
	player = Player(name, state.next_gameobject_id)
	player.pos[1] = 10
	await websocket.send(message_player_welcome(player))
	state.next_gameobject_id += 1
	# send the current state to this player
	if state.ball:
		await websocket.send(message_object_new(state.ball))
	for other_websocket, other_player in state.players.items():
		await websocket.send(message_object_new(other_player))
	for _, box in state.boxes.items():
		await websocket.send(message_object_new(box))
	# add to the list of players
	state.players[websocket] = player
	# tell all players about this new one
	await notify_players(player, message_object_new)
	# print and return
	print(f"> {name} connected")
	return player

async def unregister(websocket):
	# remove from the list of players
	player = state.players[websocket]
	del state.players[websocket]
	# tell others players about this disconnection
	await notify_players(player, message_object_part)
	# if has ball, release it
	if player.has_ball:
		state.ball = Ball(0)
		state.ball.pos = player.pos
		await notify_players(state.ball, message_object_new)
	print(f"> {player.name} disconnected")

## client processing code

async def process_client(websocket, path):
	# register(websocket) sends user_event() to websocket
	player = await register(websocket)
	try:
		# process messages from this player
		async for message in websocket:
			data = json.loads(message)
			if data['action'] == 'move':
				# set the speed of the player
				player.move(data['speed'], 0.1)
			elif data['action'] == 'weapon_trigger':
				player.fire()
			elif data['action'] == 'power_trigger':
				logging.info("Got power trigger, unimplemented yet")
			else:
				logging.error("unsupported event: {}", data)
	finally:
		await unregister(websocket)

## server-side state update

async def run_state():
	last_time = time.time()
	last_box_time = last_time
	while True:
		# main game logic loop
		cur_time = time.time()
		delta_time = cur_time - last_time

		# boxes
		if cur_time - last_box_time > BOX_RESPAWN_INTERVAL and len(state.boxes) < BOX_MAX_COUNT:
			last_box_time = cur_time
			box = Box(state.next_gameobject_id)
			state.next_gameobject_id += 1
			while True:
				box.pos = np.random.rand(2) * 2 * [WORLD_HALF_SIZE_X, WORLD_HALF_SIZE_Y] - [WORLD_HALF_SIZE_X, WORLD_HALF_SIZE_Y]
				clip_to_field(box.pos)
				if not is_on_hole(box.pos):
					break
			await notify_players(box, message_object_new)
			state.boxes[box.id] = box

		# ball collision
		if state.ball is not None and state.ball.step(delta_time, cur_time):
			await notify_players(state.ball, message_object_status)

		# bullet collision
		for bullet_id in list(state.bullets.keys()):
			bullet = state.bullets[bullet_id]
			if bullet.step(delta_time, cur_time):
				await notify_players(bullet, message_object_part)
				del(state.bullets[bullet_id])

		# loop over players
		for websocket, player in state.players.items():

			# collisions with walls
			if player.step(delta_time, cur_time):
				await notify_players(player, message_object_status)

			# hit by bullet
			for bullet_id in list(state.bullets.keys()):
				bullet = state.bullets[bullet_id]
				if player.does_collide(bullet):
					await notify_players(bullet, message_object_part)
					del(state.bullets[bullet_id])
					if bullet.weapon < 6:
						player.color = float(bullet.weapon) / 6.
						await notify_players(player, message_object_status)
					else:
						pass
						# TODO: handle cat

			# weapon firing
			if player.weapon_fired:
				player.weapon_fired = False
				if player.weapon >= 0 and not player.is_stunned(cur_time) and (cur_time - player.last_time_weapon_fired) > WEAPON_COOLDOWN:
					player.last_time_weapon_fired = cur_time
					bullet = Bullet(state.next_gameobject_id, player.weapon)
					state.next_gameobject_id += 1
					bullet.pos = player.pos + player.last_dir * (player.r + bullet.r + BULLET_SPAWN_DIST)
					bullet.speed = player.speed + player.last_dir * BULLET_VELOCITY
					await notify_players(bullet, message_object_new)
					state.bullets[bullet.id] = bullet

			# ball fetching
			if state.ball and player.does_collide(state.ball):
				player.has_ball = True
				await notify_players(player, message_object_status)
				await notify_players(state.ball, message_object_part)
				state.ball = None

			# box fetching
			for box_id in list(state.boxes.keys()):
				box = state.boxes[box_id]
				if player.does_collide(box):
					await notify_players(box, message_object_part)
					del(state.boxes[box_id])
					roll = random.randint(0,13)
					if roll == 12:
						player.weapon = 7
					else:
						player.weapon = int(roll / 2)
					await notify_players(player, message_object_status)

			# collision with other player
			for _, other in state.players.items():
				if player == other:
					continue
				# does collision happens?
				deinterlace_vector = np.empty(2)
				if player.does_collide(other, deinterlace_vector):
					# yes, process physics and possibly loose ball

					# save previous state
					prev_player_pos = player.pos
					prev_other_pos = other.pos
					prev_player_speed = player.speed
					prev_other_speed = other.speed
					prev_player_velocity = norm(player.speed)
					prev_other_velocity = norm(other.speed)
					player_had_ball = player.has_ball
					other_had_ball = other.has_ball
					player_was_stunned = player.is_stunned(cur_time)
					other_was_stunned = other.is_stunned(cur_time)

					# handle deinterlacing
					u = unitv(deinterlace_vector)
					deinterlace_margin = u * DEINTERLACE_MARGIN
					player.pos += deinterlace_vector * 0.5 + deinterlace_margin
					other.pos -= deinterlace_vector * 0.5 + deinterlace_margin

					# apply collision, reduce speed and stun
					player.set_speed(0.5 * prev_other_speed)
					other.set_speed(0.5 * prev_player_speed)
					#player.speed_cmd = player.speed
					#other.speed_cmd = other.speed
					player_velocity = norm(player.speed)
					if player_velocity < MIN_VELOCITY:
						player.speed[:] = [0, 0]
						player_velocity = 0
					other_velocity = norm(other.speed)
					if other_velocity < MIN_VELOCITY:
						other.speed[:] = [0, 0]
						other_velocity = 0
					player.last_time_stunned = other.last_time_stunned = time.time()

					# loose ball
					if player_had_ball:
						player.has_ball = False
						player.score -= 1
						state.ball = Ball(0)
						state.ball.pos = player.pos + u * (player.r + state.ball.r + BALL_DROP_DIST)
						state.ball.speed = player.speed + u * BALL_DROP_VELOCITY
						state.ball.speed_hl = 2.
					if other_had_ball:
						other.has_ball = False
						other.score -= 1
						state.ball = Ball(0)
						state.ball.pos = other.pos + u * -(other.r + state.ball.r + BALL_DROP_DIST)
						state.ball.speed = other.speed + u * -BALL_DROP_VELOCITY
						state.ball.speed_hl = 2.

					# notify when necessary
					## ball creation
					if player_had_ball or other_had_ball:
						await notify_players(state.ball, message_object_new)
					await notify_players(player, message_object_status)
					await notify_players(other, message_object_status)
		last_time = cur_time
		await asyncio.sleep(UPDATE_PERIOD)

## main code

loop = asyncio.get_event_loop()
loop.run_until_complete(websockets.serve(process_client, '', 6789))
loop.run_until_complete(run_state())
